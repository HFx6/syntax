import NoteLayout from "../../components/note/NoteLayout";
import { useSession, getSession } from "next-auth/react";
// import { useEffect, useState } from "react";
import {
	useNote,
	useDispatchNote,
	useNotes,
	useDispatchNotes,
} from "../../modules/AppContext";

const getNoteByID = require("../../prisma/Note").getNoteByID;
const getAllNotesByUserID = require("../../prisma/Note").getAllNotesByUserID;

export const getServerSideProps = async ({ req, res, params }) => {
	res.setHeader(
		"Cache-Control",
		"public, s-maxage=10, stale-while-revalidate=59"
	);
	const session = await getSession({ req });
	const { id } = params;

	if (!session) {
		res.statusCode = 403;
		return { props: { notes: [] } };
	}
	if (id && id.length > 1) {
		return {
			notFound: true,
		};
	}
	var groupBy = function(xs, key) {
		return xs.reduce(function(rv, x) {
		  (rv[x[key]] = rv[x[key]] || []).push(x);
		  return rv;
		}, {});
	 };
	 const n = await getAllNotesByUserID(session?.user?.id);
	const notes = groupBy(await getAllNotesByUserID(session?.user?.id), 'groupId');
	// const notes = await getAllNotesByUserID(session?.user?.id);
	var note;
	if (id && id.length == 1) {
		note = await getNoteByID(id[0]);
	} else {
		note = {
			title: "Hello 👋",
			body: "Select a note or start typing here to get started…",
			updatedAt: Date.now(),
			user: session?.user,
		};
	}

	return {
		props: { notes, note, n },
	};
};

export default function Note({ notes, note, n }) {
	const { data: session, status } = useSession();
	const notesc = useNotes();
	const setNotes = useDispatchNotes();

	const currentNote = useNote();
	const setCurrentNote = useDispatchNote();
	console.log(n);
	if (Object.keys(currentNote).length == 0) {
		note.action = "edit";
		setCurrentNote(note);
	}

	return <NoteLayout allNotes={notes} currentNote={note} />;
}
