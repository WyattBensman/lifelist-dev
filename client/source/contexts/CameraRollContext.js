import React, { createContext, useContext, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_ALL_CAMERA_SHOTS,
  GET_CAMERA_SHOT,
} from "../utils/queries/cameraQueries";
import {
  saveMetadataToCache,
  getMetadataFromCache,
  saveImageToFileSystem,
  getImageFromFileSystem,
  deleteImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import LRUCache from "../utils/caching/lruCacheHelper";

const CameraRollContext = createContext();

const CACHE_KEY_METADATA = "cameraRollMetadata";
const DOCUMENT_THUMBNAIL_LIMIT = 24; // Persistent thumbnails limit
const FULL_RESOLUTION_CACHE_LIMIT = 16; // Max full-resolution images in memory

const fullResolutionCache = new LRUCache(FULL_RESOLUTION_CACHE_LIMIT);

export const CameraRollProvider = ({ children }) => {
  const [shots, setShots] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isCameraRollCacheInitialized, setIsCameraRollCacheInitialized] =
    useState(false);

  const { refetch: fetchShots } = useQuery(GET_ALL_CAMERA_SHOTS, {
    skip: true, // Use refetch for manual invocation
  });

  const [fetchShot] = useLazyQuery(GET_CAMERA_SHOT);

  // === Initialize CameraRoll Cache ===
  const initializeCameraRollCache = async () => {
    if (isCameraRollCacheInitialized) return;

    try {
      const cachedData = await getMetadataFromCache(CACHE_KEY_METADATA);
      if (cachedData) {
        setShots(cachedData.shots);
        setNextCursor(cachedData.nextCursor);
        setHasNextPage(cachedData.hasNextPage);
      } else {
        await loadNextPage();
      }
      setIsCameraRollCacheInitialized(true);
    } catch (error) {
      console.error("[CameraRoll] Error initializing cache:", error);
    }
  };

  // === Load Next Page ===
  const loadNextPage = async () => {
    if (!hasNextPage) return;

    try {
      const { data } = await fetchShots({ cursor: nextCursor, limit: 12 });

      if (data?.getAllCameraShots) {
        const newShots = data.getAllCameraShots.shots || [];
        const newCursor = data.getAllCameraShots.nextCursor;
        const newHasNextPage = data.getAllCameraShots.hasNextPage;

        const mergedShots = [...shots, ...newShots];
        setShots(mergedShots);
        setNextCursor(newCursor);
        setHasNextPage(newHasNextPage);

        // Save updated metadata and thumbnails
        await saveMetadataToCache(CACHE_KEY_METADATA, {
          shots: mergedShots,
          nextCursor: newCursor,
          hasNextPage: newHasNextPage,
        });

        // Save thumbnails for new shots up to the limit
        const startIndex = shots.length;
        for (
          let i = startIndex;
          i < Math.min(mergedShots.length, DOCUMENT_THUMBNAIL_LIMIT);
          i++
        ) {
          const shot = mergedShots[i];
          const thumbnailKey = `thumbnail_${shot._id}`;
          await saveImageToFileSystem(thumbnailKey, shot.imageThumbnail, true);
        }
      } else {
        console.warn("[CameraRoll] No data returned from fetchShots.");
      }
    } catch (error) {
      console.error("[CameraRoll] Error loading next page:", error);
    }
  };

  // === Fetch Full-Resolution Image with LRU Cache ===
  const fetchFullResolutionImage = async (shotId) => {
    try {
      let imagePath = fullResolutionCache.get(shotId);

      if (!imagePath) {
        imagePath = await getImageFromFileSystem(shotId);
        if (!imagePath) {
          const { data } = await fetchShot({ variables: { shotId } });
          if (!data?.getCameraShot) throw new Error("Image not found.");
          imagePath = data.getCameraShot.image;
          await saveImageToFileSystem(shotId, imagePath, false); // Save to cache directory
        }
        fullResolutionCache.put(shotId, imagePath);
      }

      return imagePath;
    } catch (error) {
      console.error(
        `[CameraRoll] Error fetching full-resolution image for ${shotId}:`,
        error
      );
      return null;
    }
  };

  // === Preload Images Around Current Index ===
  const preloadFullResolutionImages = async (currentIndex) => {
    try {
      // Hardcoded preloading indices: current, previous, and next
      const preloadIndices = [currentIndex - 1, currentIndex, currentIndex + 1];

      // Ensure indices are within bounds of the shots array
      const validIndices = preloadIndices.filter(
        (index) => index >= 0 && index < shots.length
      );

      // Preload images for valid indices
      for (const index of validIndices) {
        const shotId = shots[index]._id;
        await fetchFullResolutionImage(shotId);
      }
    } catch (error) {
      console.error("[CameraRoll] Error preloading images:", error);
    }
  };

  // === Add Shot to Camera Roll ===
  const addShotToRoll = async (newShot) => {
    try {
      const updatedShots = [newShot, ...shots];
      setShots(updatedShots);

      await saveMetadataToCache(CACHE_KEY_METADATA, {
        shots: updatedShots,
        nextCursor,
        hasNextPage,
      });

      const thumbnailKey = `thumbnail_${newShot._id}`;
      if (updatedShots.length <= DOCUMENT_THUMBNAIL_LIMIT) {
        await saveImageToFileSystem(thumbnailKey, newShot.imageThumbnail, true);
      } else {
        await saveImageToFileSystem(
          thumbnailKey,
          newShot.imageThumbnail,
          false
        );
      }
    } catch (error) {
      console.error("[CameraRoll] Error adding shot:", error);
    }
  };

  // === Remove Shot from Camera Roll ===
  const removeShotFromRoll = async (shotId) => {
    try {
      const updatedShots = shots.filter((shot) => shot._id !== shotId);
      setShots(updatedShots);

      await saveMetadataToCache(CACHE_KEY_METADATA, {
        shots: updatedShots,
        nextCursor,
        hasNextPage,
      });

      const thumbnailKey = `thumbnail_${shotId}`;
      await deleteImageFromFileSystem(thumbnailKey);
    } catch (error) {
      console.error(`[CameraRoll] Error removing shot ${shotId}:`, error);
    }
  };

  // === Update Metadata for a Shot ===
  const updateShotMetadata = (shotId, updates) => {
    try {
      const updatedShots = shots.map((shot) =>
        shot._id === shotId ? { ...shot, ...updates } : shot
      );
      setShots(updatedShots);

      saveMetadataToCache(CACHE_KEY_METADATA, {
        shots: updatedShots,
        nextCursor,
        hasNextPage,
      });
    } catch (error) {
      console.error(
        `[CameraRoll] Error updating metadata for ${shotId}:`,
        error
      );
    }
  };

  // === Reset Camera Roll State ===
  const resetCameraRollState = () => {
    setShots([]);
    setNextCursor(null);
    setHasNextPage(true);
    setIsCameraRollCacheInitialized(false);
  };

  const contextValue = {
    shots,
    hasNextPage,
    loadNextPage,
    fetchFullResolutionImage,
    preloadFullResolutionImages,
    addShotToRoll,
    removeShotFromRoll,
    updateShotMetadata,
    initializeCameraRollCache,
    isCameraRollCacheInitialized,
    resetCameraRollState,
  };

  return (
    <CameraRollContext.Provider value={contextValue}>
      {children}
    </CameraRollContext.Provider>
  );
};

export const useCameraRoll = () => useContext(CameraRollContext);