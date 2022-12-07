// without Babel in ES2015
const { NFC } = require("nfc-pcsc");

const fetchDevice = (done) => {
  console.log("fetchDevice() called");
  const nfc = new NFC();

  nfc.on("reader", (reader) => {
    console.log(`${reader.reader.name}  device attached`);
    done({ success: true, readerName: reader.reader.name });
  });

  nfc.on("error", (err) => {
    done({ success: false, error: err });
  });
};

const flashCard = (flashData, done) => {
  console.log("flashCard() called");
  const nfc = new NFC();
  nfc.on("reader", async (reader) => {
    console.log(`${reader.reader.name}  device attached`);
    reader.aid = Buffer.from("F222222222", "hex");
    reader.on("card", async (card) => {
      console.log(`${card} - card found`);

      const key = "FFFFFFFFFFFF";
      const keyType = 0x60;

      //Authenticate Card
      try {
        await reader.authenticate(4, keyType, key);

        console.log(`sector 1 successfully authenticated`, reader);
        //Flash Data to the Card
        try {
          const data = Buffer.allocUnsafe(16);
          data.fill(0);
          data.writeInt32BE(flashData, 0);

          await reader.write(4, data, 16); // blockSize=16 must specified for MIFARE Classic cards

          console.log(`data written`, reader, flashData, data);
          done({ success: true });
        } catch (err) {
          console.error(`error when writing data`, reader, err);
          done({ success: false, message: err });
        }
      } catch (err) {
        console.error(
          `error when authenticating block 4 within the sector 1`,
          reader,
          err
        );
        done({ success: false, message: err });
        return;
      }
    });
  });
};

// fetchDevice((success, msg) => {
//   console.log(success, msg);
// });

flashCard("123456789", (success, message) => {
  console.log(success, message);
});
