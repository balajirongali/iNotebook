import React, { useState } from "react";
import NoteContext from "./noteContext";
const backendURL = process.env.REACT_APP_BACKEND_URL;

const NoteState=(props)=>{
    const notesInitial=[]

    const [notes,setNotes]=useState(notesInitial);
    //Get all Notes
    const getNotes=async ()=>{
      //TODO: API call
      const response = await fetch(`${backendURL}/api/notes/fetchallnotes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token":localStorage.getItem('token')
        }
        
      });
      const json=await response.json()

      setNotes(json);
    }

    //Add a Note
    const addNote=async (title,description,tag)=>{
      // API call
      const response = await fetch(`${backendURL}/api/notes/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token":localStorage.getItem('token')
        },
        // Automatically converted to "username=example&password=password"
        body: JSON.stringify({title,description,tag})
        // ...
      });

      const note=await response.json();
      setNotes(notes.concat(note));

      
    }

    //Delete a Note
    const deleteNote=async (id)=>{
      //api call
      const response = await fetch(`${backendURL}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token":localStorage.getItem('token')
        }
      });
      const json=response.json();  
      console.log(json)

      const newNotes=notes.filter((note)=>{return note._id!==id})
      setNotes(newNotes);
      
    }

    //Edit a Note
    const editNote=async (id,title,description,tag)=>{
      //Api call
      const response = await fetch(`${backendURL}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token":localStorage.getItem('token')
        },
        // Automatically converted to "username=example&password=password"
        body: JSON.stringify({title,description,tag})
        // ...
      });
      const json=await response.json();
      console.log(json);
      let newNotes=JSON.parse(JSON.stringify(notes));
      //Logic to edit in Client
      for (let index = 0; index < newNotes.length; index++) {
        const element = newNotes[index];
        if (element._id === id) {
          newNotes[index].title = title;
          newNotes[index].description = description;
          newNotes[index].tag = tag;
          break;
        }
      }
      setNotes(newNotes);
    }

    return(
        <NoteContext.Provider value={{notes,addNote,deleteNote,editNote,getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )

}

export default NoteState;