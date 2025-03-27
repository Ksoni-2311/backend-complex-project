import multer from 'multer'

//copied code from multer as it is to store and run it to store a file for a certain while on our server till its uploaded at cloudniary 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/my-uploads')
    },
    filename: function (req, file, cb) {

// below[line no11] is used to give an custom name to saved file BUT actually we use originalName innstead of it in cb=>Callback  
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({
storage,
})


// console.log()