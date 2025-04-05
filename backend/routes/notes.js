const express=require('express');
const { body, validationResult } = require('express-validator');
const router=express.Router()
var fetchuser=require('../middleware/fetchuser')
const Note = require('../models/Note');

//ROUTE 1:get all notes using GET "/api/notes/getuser".  login required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
        const notes=await Note.find({user:req.user.id});
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server occured");
    }
    
})

//ROUTE 2:add a new notes using POST "/api/notes/addnote".  login required
router.post('/addnote',fetchuser,[
    body('title','enter a valid title').isLength({min:3}),
    body('description','description should be atleast 5 characters').isLength({min:5})
],async (req,res)=>{
    try {
        const {title,description,tag}=req.body;
     //if there are errors return bad request
     const result = validationResult(req);
     if (!result.isEmpty()) {
     return res.status(400).json({ errors: result.array() });
     }
    
    const note=new Note({
        title,description,tag,user:req.user.id
    })
    const savedNote=await note.save()

    res.json(savedNote);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server occured");
    }
    
})

//ROUTE 3:update note using PUT "/api/notes/updatenote".  login required
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag}=req.body;
    try {
        
    
    //create a new note
    const newNote={};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //find the note to be updated and update it
    let note=await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Note not found")};

    //check if the user is same
    if(note.user.toString()!==req.user.id)
    {
        return res.status(401).send("not allowed");
    }

    note=await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
    res.json({note});
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server occured");
}
})

//ROUTE 4:delete an existing note using DELETE "/api/notes/deletenote".  login required
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{

    try {
    //find the note to be deleted is present or not
    let note=await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Note not found")};

    //allow deletion only if user owns this Note
    if(note.user.toString()!==req.user.id)
    {
        return res.status(401).send("not allowed");
    }

    note=await Note.findByIdAndDelete(req.params.id);
    res.json({"Success":"Note has been deleted",note:note});
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server occured");
}
})

module.exports=router