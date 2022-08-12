import Link from "next/link";
import React from "react";

import compareImages from "resemblejs";
import fs from "mz/fs";

async function getDiff() {
  const options = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: "antialiasing",
  };

  const data = await compareImages(
    await fs.readFile("./People.jpg"),
    await fs.readFile("./People2.jpg"),
    options
  );

  await fs.writeFile("./output.png", data.getBuffer());
}

getDiff();

export default function Home() {
  return (
    <div>
      Hello World.
      <Link href="/about">About</Link>
    </div>
  );
}
