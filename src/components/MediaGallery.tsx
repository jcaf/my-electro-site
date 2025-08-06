'use client';

interface MediaGalleryProps {
  images: string[];
  videos: string[];
  apiUrl: string;
}

export default function MediaGallery({ images, videos, apiUrl }: MediaGalleryProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, src: string) => {
    console.error(`Error loading image: ${src}`);
    e.currentTarget.style.display = 'none';
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>, src: string) => {
    console.error(`Error loading video: ${src}`);
    e.currentTarget.style.display = 'none';
  };

  return (
    <>
      {/* Imágenes */}
      {images.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-3">Imágenes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {images.map((rel, idx) => {
              const src = `${apiUrl}/static/${encodeURI(rel)}`;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={src}
                  alt={`img-${idx}`}
                  className="w-full h-56 object-cover rounded-lg border border-gray-700"
                  onError={(e) => handleImageError(e, src)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-3">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {videos.map((rel, idx) => {
              const src = `${apiUrl}/static/${encodeURI(rel)}`;
              return (
                <video
                  key={idx}
                  src={src}
                  className="w-full rounded-lg border border-gray-700"
                  controls
                  onError={(e) => handleVideoError(e, src)}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}