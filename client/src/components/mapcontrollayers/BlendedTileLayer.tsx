import { createTileLayerComponent, LayerProps } from "@react-leaflet/core";
import L from "leaflet";

export interface BlendedTileLayerProps extends LayerProps {
  baseUrl: string;
  overlayUrl: string;
  blendMode?: GlobalCompositeOperation;
  baseFilter?: string;
  overlayFilter?: string;
  overlayOpacity?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
}

interface CanvasBlendLayerOptions extends L.GridLayerOptions {
  baseUrl: string;
  overlayUrl: string;
  blendMode: GlobalCompositeOperation;
  baseFilter: string;
  overlayFilter: string;
  overlayOpacity: number;
}

const loadImg = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });

class CanvasBlendLayer extends L.GridLayer {
  private opts: CanvasBlendLayerOptions;

  constructor(options: CanvasBlendLayerOptions) {
    super(options);
    this.opts = options;
  }

  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = L.DomUtil.create("canvas", "leaflet-tile") as HTMLCanvasElement;
    const size = this.getTileSize();
    tile.width = size.x;
    tile.height = size.y;
    const ctx = tile.getContext("2d");

    if (!ctx) {
      setTimeout(() => done(undefined, tile), 0);
      return tile;
    }

    const s = ["a", "b", "c"][Math.abs(coords.x + coords.y) % 3];
    const r = L.Browser.retina ? "@2x" : "";
    const bUrl = L.Util.template(this.opts.baseUrl, { ...coords, s, r });
    const oUrl = L.Util.template(this.opts.overlayUrl, { ...coords, s, r });

    // Load base tile first; optional overlay layer added upon successful load
    loadImg(bUrl)
      .then((baseImg) => {
        ctx.save();
        if (this.opts.baseFilter && this.opts.baseFilter !== "none") ctx.filter = this.opts.baseFilter;
        ctx.drawImage(baseImg, 0, 0, size.x, size.y);
        ctx.restore();

        return loadImg(oUrl)
          .then((overlayImg) => {
            ctx.save();
            ctx.globalCompositeOperation = this.opts.blendMode;
            ctx.globalAlpha = this.opts.overlayOpacity;
            if (this.opts.overlayFilter && this.opts.overlayFilter !== "none") ctx.filter = this.opts.overlayFilter;
            ctx.drawImage(overlayImg, 0, 0, size.x, size.y);
            ctx.restore();
          })
          .catch(() => {}); // If hillshade 404s, fail silently and keep base tile
      })
      .then(() => done(undefined, tile))
      .catch((err) => done(err, tile));

    return tile;
  }
}

export const BlendedTileLayer = createTileLayerComponent<
  CanvasBlendLayer,
  BlendedTileLayerProps
>(
  function createBlendedTileLayer(props, context) {
    const instance = new CanvasBlendLayer({
      ...props,
      blendMode: props.blendMode || "multiply",
      baseFilter: props.baseFilter || "none",
      overlayFilter: props.overlayFilter || "none",
      overlayOpacity: props.overlayOpacity ?? 1.0,
      maxZoom: props.maxZoom || 19,
      maxNativeZoom: props.maxNativeZoom || 16,
    });
    return { instance, context };
  },
  function updateBlendedTileLayer(instance, props, prevProps) {
    if (
      props.baseUrl !== prevProps.baseUrl ||
      props.overlayUrl !== prevProps.overlayUrl ||
      props.blendMode !== prevProps.blendMode ||
      props.baseFilter !== prevProps.baseFilter ||
      props.overlayFilter !== prevProps.overlayFilter ||
      props.overlayOpacity !== prevProps.overlayOpacity
    ) {
      instance.redraw();
    }
  }
);