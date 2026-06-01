const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const bookController = require('../controller/bookController');
//controller

// get request
router.get('/',bookController.findAllBook);
// get request for single object
router.get('/:id',bookController.getBookById);
// router.get('/:id',(req,res,next)=>{
//     const id = req.params.id;
//     var query = "select * from book where id=?";
//     connection.query(query,[id],(err,results)=>{
//         if(!err){
//             if(results == null){
//                 return res.status(400).json({message:"book id does not match."});

//             }
//             return res.status(200).json(results)
//         }
//         else{
//             return res.status(500).json(err);
//         }
//     });
// });

// post request
router.post('/',bookController.saveBook);

// put or patch request
router.patch('/update/:id',bookController.updateBook);
// delete request+
router.delete('/:id',bookController.deleteBook);



module.exports =router;