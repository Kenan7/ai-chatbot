import { LoaderIcon } from './icons';
import cn from 'classnames';

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({
  title,
  content,
  status,
  isInline,
}: ImageEditorProps) {
  // Check if content is logo data (JSON array)
  const isLogoData = (() => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) && parsed.length === 4;
    } catch {
      return false;
    }
  })();

  if (status === 'streaming') {
    return (
      <div
        className={cn('flex flex-row items-center justify-center w-full', {
          'h-[calc(100dvh-60px)]': !isInline,
          'h-[200px]': isInline,
        })}
      >
        <div className="flex flex-row gap-4 items-center">
          {!isInline && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
          <div>Generating Product Mockups...</div>
        </div>
      </div>
    );
  }

  // Render 4-logo grid for logo data
  if (isLogoData) {
    const logos = JSON.parse(content);
    
    // Product names based on image filenames
    const productNames = ['Scarf', 'Socks', 'Tote Bag', 'Package'];
    
    return (
      <div
        className={cn('w-full', {
          'h-[calc(100dvh-60px)] flex items-center justify-center': !isInline,
          'h-auto': isInline,
        })}
      >
        <div className="w-full max-w-4xl p-4">
          <div className="mb-4 text-center">
            <p className="text-sm text-zinc-600 mb-4">
              Here are 4 different product mockups showing how your brand could look on various items. These can be customized with your logo and branding.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {logos.map((logoSrc: string, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  // Copy image path to clipboard
                  navigator.clipboard.writeText(logoSrc);
                }}
              >
                <div className="aspect-square flex items-center justify-center bg-white rounded border">
                  <img
                    src={logoSrc}
                    alt={productNames[index]}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  {productNames[index]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render single image for regular image generation
  return (
    <div
      className={cn('flex flex-row items-center justify-center w-full', {
        'h-[calc(100dvh-60px)]': !isInline,
        'h-[200px]': isInline,
      })}
    >
      <picture>
        <img
          className={cn('w-full h-fit max-w-[800px]', {
            'p-0 md:p-20': !isInline,
          })}
          src={`data:image/png;base64,${content}`}
          alt={title}
        />
      </picture>
    </div>
  );
}
