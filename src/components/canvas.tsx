import * as React from "react";
import { useRef, useEffect, useCallback, SyntheticEvent, useMemo } from "react";

export type InteractionEvent =
  | {
      kind: "on";
      data: ImageData;
      contour: ImageData;
      x: number;
      y: number;
    }
  | {
      kind: "off";
      contour: null;
      data: null;
      x: null;
      y: null;
    };
export const Canvas = ({
  url,
  onInteraction
}: {
  url: string | null;
  onInteraction: (event: InteractionEvent) => void;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const contours = useMemo<HTMLCanvasElement>(() => {
    // @ts-ignore
    return new OffscreenCanvas(0, 0);
  }, []);

  const draw = useCallback(() => {
    if (canvas.current instanceof HTMLCanvasElement && url !== null) {
      const img = new Image();
      img.onload = () => {
        canvas.current!.width = window.innerWidth;
        canvas.current!.height = window.innerHeight;
        contours.width = window.innerWidth;
        contours.height = window.innerHeight;
        const MAX_WIDTH = canvas.current!.width;
        const MAX_HEIGHT = canvas.current!.height;

        let width = img.width;
        let height = img.height;

        // Change the resizing logic
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        const context = canvas.current!.getContext("2d")!;
        const contoursContext = contours.getContext("2d")!;

        const xd = (MAX_WIDTH - width) / 2;
        const yd = (MAX_HEIGHT - height) / 2;

        context.drawImage(img, xd, yd, width, height);

        // const data = context.getImageData(xd, yd, width, height)!;

        // const worker = new Worker(
        //   new URL("../workers/contours.ts", import.meta.url),
        //   { type: "module" }
        // );

        // worker.postMessage({
        //   image: data,
        //   width: MAX_WIDTH,
        //   height: MAX_HEIGHT,
        //   xd,
        //   yd
        // });

        // worker.onmessage = (message: MessageEvent<ImageData>) => {
        //   context.putImageData(message.data, 0, 0);
        // };
      };
      img.src = url;
    }
  }, [url]);

  useEffect(() => draw(), [draw, url]);

  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const interaction = useCallback(
    (event: SyntheticEvent<HTMLCanvasElement, MouseEvent | TouchEvent>) => {
      event.preventDefault();
      const kind =
        event.type === "mouseout" || event.type === "touchend" ? "off" : "on";

      if (kind === "off") {
        return onInteraction({
          kind,
          contour: null,
          x: null,
          y: null,
          data: null
        });
      }

      let x = 0;
      let y = 0;

      if (event.type === "touchmove" || event.type === "touchstart") {
        const touches = (event.nativeEvent as TouchEvent).touches;
        x = touches[0].clientX;
        y = touches[0].clientY;
      } else if (event.type === "mousemove") {
        const { x: mouseX, y: mouseY } = event.nativeEvent as MouseEvent;

        x = mouseX;
        y = mouseY;
      }

      const data = canvas.current!.getContext("2d")!.getImageData(x, y, 1, 1)!;
      const contour = contours.getContext("2d")!.getImageData(x, y, 1, 1);

      onInteraction({
        kind,
        contour,
        x,
        y,
        data
      });
    },
    [onInteraction]
  );

  return (
    <canvas
      ref={canvas}
      onTouchStart={interaction}
      onTouchMove={interaction}
      onTouchEnd={interaction}
      onMouseOut={interaction}
      onMouseMove={interaction}
    />
  );
};
