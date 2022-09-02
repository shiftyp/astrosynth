import * as React from "react";
import { useState, useEffect } from "react";
import { Uploader } from "./uploader";
import { Canvas, InteractionEvent } from "./canvas";
import { play, init } from "../feedback/synth";
import { vibrate } from "../feedback/haptic";
import { rgb2hsv } from "../feedback/convert";

export const App = () => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(init, [url])

  const onInteraction = (event: InteractionEvent) => {
    console.log(event);
    if (event.kind === "on") {
      const [r, g, b] = Array.from(event.data.data);
      //const [rc, gc, bc] = Array.from(event.data.data);
      const [h, s, l]= rgb2hsv(r, g, b);

      play((1 - h / 360) * 126 + 130, l / 100);
      if (l / 25) vibrate([100, 100, 100]);
    } else {
      play(0, 0);
      vibrate(0);
    }
  };
  return (
    <>
      {!url ? (
        <Uploader onImage={setUrl} />
      ) : (
        <Canvas url={url} onInteraction={onInteraction} />
      )}
    </>
  );
};
