import { useSession, signIn, signOut, getSession } from "next-auth/react"
import { useState } from "react";
import Tiptap from '../components/Tiptap'
import { Button } from '@nextui-org/react';

const getAllNotesByUserID = require("../prisma/Note").getAllNotesByUserID;

export const getServerSideProps = async ({ req, res }) => {
	const session = await getSession({ req });
	if (!session) {
		res.statusCode = 403;
		return { props: { notes: [] } };
	}
	const notes = await getAllNotesByUserID(session?.user?.id);
	console.log({ notes });
	return {
		props: { notes },
	};
};

export default function Component({}) {
	const { data: session } = useSession()
	if (!session) {
		return (
			<>
				Not signed in <br />
				<Button onClick={() => signIn()}>Sign in</Button>
			</>
		);
	}

	return (
		<div>
			Signed in as {session.user.email} <br />
			<Button onClick={() => signOut()}>Sign out</Button>
			<Tiptap/>
        </div>
	)
}