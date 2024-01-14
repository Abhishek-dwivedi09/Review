import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import XLSX from "xlsx";

// Upload image File using multer
var storageFile = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

// Upload image using multer
const imageUpload = multer({
  storage: storageFile,
  limits: {
    fileSize: "5000000",
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|wav|mp3|mp4|svg|pdf)$/)) {
      return cb(
        new Error(
          "Please upload document in png,jpg,jpeg,wav,mp3,mp4,svg,pdf file format"
        )
      );
    }
    cb(undefined, true);
  },
});

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "us-east-1",
});

 const s3 = new aws.S3(); 

const uploads = multer({
  storage: multerS3({
    s3: s3,
   bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now().toString() + "-" + file.originalname
      );
    },
  }),
});

const readFile = async (fileData) => {
  // Get buffered file from s3
  function getBufferFromS3(file, callback) {
    const buffers = [];
    const s3 = new aws.S3();
    const stream = s3
      .getObject({ Bucket: process.env.AWS_BUCKET, Key: fileData.key })
      .createReadStream();
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => callback(null, Buffer.concat(buffers)));
    stream.on("error", (error) => callback(error));
  }

  // promisify read stream from s3
  function getBufferFromS3Promise(file) {
    return new Promise((resolve, reject) => {
      getBufferFromS3(file, (error, s3buffer) => {
        if (error) return reject(error);
        return resolve(s3buffer);
      });
    });
  }

  // create workbook from buffer
  const buffer = await getBufferFromS3Promise(fileData);
  const workbook = XLSX.read(buffer);

  // var workBook = XLSX.readFile(fileData.bucket);
  let workSheet = workbook.SheetNames;
  var xlsxData;
  var x = 0;
  workSheet.forEach((element) => {
    xlsxData = XLSX.utils.sheet_to_json(workbook.Sheets[workSheet[x]]);
    x++;
  });
  return xlsxData;
};

export { imageUpload, uploads, readFile };

// export { imageUpload,  readFile };
