import { contours as d3Contours } from "d3-contour";
import { rgb2hsv } from "../feedback/convert";

onmessage = (
  message: MessageEvent<{
    image: ImageData;
    width: number;
    height: number;
    xd: number;
    yd: number;
  }>
) => {
  if (!message.data.image) return;
  
  console.log('recieved');
  // @ts-ignore
  const input: HTMLCanvasElement = new OffscreenCanvas(
    message.data.width,
    message.data.height
  );
  // @ts-ignore
  const contours: HTMLCanvasElement = new OffscreenCanvas(
    Math.min(message.data.width, 500),
    message.data.height * (Math.min(message.data.width, 500) / message.data.width)
  );
  // @ts-ignore
  const output: HTMLCanvasElement = new OffscreenCanvas(
    message.data.width,
    message.data.height
  );
  const inputContext = contours.getContext("2d")!;
  const contoursContext = contours.getContext("2d")!;
  const outputContext = contours.getContext("2d")!;

  inputContext.putImageData(message.data.image, message.data.xd, message.data.yd)

  contoursContext.drawImage(input, 0, 0, contours.width, contours.height)

  const contoursData = contoursContext.getImageData(0, 0, contours.width, contours.height)

  const hues = [];

  for (let i = 0; i < contoursData.data.length; i += 4) {
    const [r, g, b] = [contoursData.data[i], contoursData.data[i + 1], contoursData.data[i + 2]];
    const [h] = rgb2hsv(r, g, b);

    hues.push(h);
  }

  console.log('contour start')
  const d3Contour = d3Contours().size([
    message.data.width,
    message.data.height
  ])(hues);
  console.log('contour end')

  console.log('draw start')
  d3Contour.forEach((ctr) => {
    ctr.coordinates.forEach((position) =>
      position.forEach((coord, i) => {
        const [x, y] = coord[0];

        if (i === 0) {
          contoursContext.fillStyle = `hsl(${ctr.value}, 50%, 50%)`;
          console.log(contoursContext.fillStyle)
          contoursContext.moveTo(x, y);
        } else {
          contoursContext.lineTo(x, y);
        }

        if (i === position.length - 1) {
          contoursContext.fill();
        }
      })
    );

    outputContext.drawImage(contours, 0, 0, message.data.width, message.data.height)
    
  });
  console.log('draw end')

  postMessage(
    outputContext.getImageData(0, 0, message.data.width, message.data.height)
  );
};
