'use client';

import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

export function MetaPixel() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    
    if (pixelId) {
      ReactPixel.init(pixelId);
      ReactPixel.pageView();
    }
  }, []);

  return null;
}
