import { json,redirect } from '@remix-run/node';

import NoteList, {links as noteListLinks} from '../components/NoteList';
import  NewNote, {links as newNoteLinks} from '~/components/NewNote'
import { getStoredNotes, storeNotes } from '~/data/notes';
import { Link, useCatch, useLoaderData } from '@remix-run/react';

export function meta(){
  return {
    title:'All Notes',
    desscription: 'Manage your notes.'
  }
}

export default function NotesPage(){
    const notes = useLoaderData();
    return(
        <main>
           <NewNote />
           <NoteList notes={notes} />
        </main>
    );
}

export async function loader(){
    const notes = await getStoredNotes();
    if (!notes || notes.length === 0) {
      throw json(
        { message: 'Could not find any notes.' },
        {
          status: 404,
          statusText: 'Not Found',
        }
      );
    }
    return notes;
    // return new Response(JSON.stringify(notes), {headers: {'Content-type' : 'application/json'}});
    // return json(notes);
}

//backend code always in actions, not loaded on client side
export async function action({request}){

    //get data from form
    const formData = await request.formData();
    const noteData  = Object.fromEntries(formData);
    // const noteData = {
    //     title: formData.get('title'),
    //     content: formData.get('content')
    // };

    /* check if the title in noteData is less than 5,
     if yes the n return message which is picked up using useActionData(); (in NewNote)*/
    if (noteData.title.trim().length < 5) {
        return { message: 'Invalid title - must be at least 5 characters long.' };
    }

    // attatch the notes with id, and update 
    const existingNotes = await getStoredNotes();
    noteData.id = new Date().toISOString();
    const updatedNotes = existingNotes.concat(noteData);
    
    //write the updated notes to notes.json
    await storeNotes(updatedNotes);

    //redirect back to which page after processing the request
    return redirect('/notes');
}


export function CatchBoundary() {
  const caughtResponse = useCatch();

  const message = caughtResponse.data?.message || 'Data not found.';

  return (
    <main>
      <NewNote />
      <p className='info-message'>{message}</p>
    </main>
  );
}

export function ErrorBoundary({ error }) {
    return (
      <main className="error">
        <h1>An error related to your notes occurred!</h1>
        <p>{error.message}</p>
        <p>
          Back to <Link to="/">safety</Link>!
        </p>
      </main>
    );
  }


export function links() {
    return [...newNoteLinks(), ...noteListLinks()];
  }