import ExportModal from "@/components/modal/ExportModal";
import DeleteModal from "@/components/modal/DeleteModal";
import { Dropdown, Button, Navbar, useTheme } from "@nextui-org/react";
import { useTheme as useNextTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
	EllipsisHorizontalIcon,
	TrashIcon,
	ShareIcon,
	LockClosedIcon,
	DocumentArrowUpIcon,
	ChevronDoubleRightIcon,
	ChevronDoubleLeftIcon,
	SunIcon,
	MoonIcon,
	ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/solid";

import {
	useNote,
	useDispatchNote,
	useNotes,
	useDispatchNotes
} from "../../modules/AppContext";

const NoteNavbar = ({ sidebarDisplay, handleSidebarDisplay }) => {
	const { setTheme } = useNextTheme();
	const { checked, type } = useTheme();
	const [selectedKey, setSelectedKey] = useState();
	const [exportModal, setExportModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const currentNote = useNote();
	const setNotes = useDispatchNotes();
	const router = useRouter();
	const { data: session, status } = useSession();

	const deleteNoteHandler = async () => {
		try {
			let res = await fetch(`/api/note`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(currentNote.id)
			});
			const deletedNote = await res.json();
			setNotes({ note: deletedNote, type: "remove" });
			router.push(`/note`, "/");
			setDeleteModal(false);
			setSelectedKey();
			
		} catch (error) {
			console.log(error);
		}
	};

	 const exportNoteHandler = async (fileType) => {
	 	try{
	 		console.log(fileType)
	 		if (fileType =="HTML"){
	 			let res = await fetch(`/api/note/${currentNote.id}/export/html`, {
	 				method: "GET",
          
	 			});
	 			let { text } = await res.json()
	 			console.log(text)
	 			const blob = new Blob([text], {type: "text/html"})
	 			const link = document.createElement('a');
	 			link.href = URL.createObjectURL(blob);
	 			link.setAttribute('download', `${currentNote.title}.html`);
	 			link.click();
	 		} else if (fileType =="Markdown") {
	 			const res = await fetch(`/api/note/${currentNote.id}/export/md`, {
	 				method: "GET",
	 			});
	 			let { text } = await res.json()
	 			const blob = new Blob([text], {type: "text/markdown"})
	 			const link = document.createElement('a');
	 			link.href = URL.createObjectURL(blob);
	 			link.setAttribute('download', `${currentNote.title}.md`);
	 			link.click();
	 		}
	 		else if (fileType == "PDF"){
				let res = await fetch(`/api/note/${currentNote.id}/export/pdf`, {
					method: "GET"
				});
				const { text } = await res.json();
				const blob = await new Blob([Buffer.from(text)], {
					type: "application/pdf"
				});
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.setAttribute("download", `${currentNote.title}.pdf`);
				link.click();
			} 
	 	} catch (error) {
	 		console.log(error)
	 	}
	 }

	const closeHandler = () => {
		setExportModal(false);
		setDeleteModal(false);
		setSelectedKey();
	};

	useEffect(() => {
		switch (selectedKey) {
			case "export":
				setExportModal(true);
				break;
			case "delete":
				setDeleteModal(true);
				break;
			case "changeTheme":
				type === "dark" ? setTheme("light") : setTheme("dark");
				setSelectedKey();
				break;
			case "signOut":
				signOut();
				setSelectedKey();
				break;
		}
	}, [selectedKey]);

	return (
		<Navbar
			variant="sticky"
			disableShadow
			disableBlur
			css={{ zIndex: 2 }}
			containerCss={{
				minWidth: "100%"
			}}
		>
			<Navbar.Content>
				<Navbar.Item css={{ display: "none", "@xs": { display: "flex" } }}>
					<Button
						auto
						light
						animated={false}
						onPress={handleSidebarDisplay}
						icon={
							sidebarDisplay ? (
								<ChevronDoubleRightIcon
									style={{ height: "var(--icon-size)" }}
								/>
							) : (
								<ChevronDoubleLeftIcon style={{ height: "var(--icon-size)" }} />
							)
						}
					/>
				</Navbar.Item>
				<Navbar.Item css={{ display: "flex", "@xs": { display: "none" } }}>
					<Button
						auto
						light
						animated={false}
						onPress={handleSidebarDisplay}
						icon={
							<ChevronDoubleLeftIcon style={{ height: "var(--icon-size)" }} />
						}
					>
						All Notes
					</Button>
				</Navbar.Item>
			</Navbar.Content>
			<Navbar.Content gap={5}>
				<Navbar.Item>
					<Dropdown placement="bottom-right">
						<Dropdown.Button
							light
							icon={<EllipsisHorizontalIcon style={{ height: "30px" }} />}
						/>
						<Dropdown.Menu
							disabledKeys={["share", "lock"]}
							onAction={setSelectedKey}
							aria-label="Note Options"
						>
							<Dropdown.Section aria-label="Note Actions">
								<Dropdown.Item
									key="share"
									icon={<ShareIcon style={{ height: "var(--icon-size-s)" }} />}
								>
									Share
								</Dropdown.Item>
								<Dropdown.Item
									key="lock"
									icon={
										<LockClosedIcon style={{ height: "var(--icon-size-s)" }} />
									}
								>
									Lock
								</Dropdown.Item>
								<Dropdown.Item
									key="export"
									icon={
										<DocumentArrowUpIcon
											style={{ height: "var(--icon-size-s)" }}
										/>
									}
								>
									Export
								</Dropdown.Item>
								<Dropdown.Item
									key="delete"
									color="error"
									icon={<TrashIcon style={{ height: "var(--icon-size-s)" }} />}
								>
									Delete
								</Dropdown.Item>
							</Dropdown.Section>
							<Dropdown.Section aria-label="User Actions">
								<Dropdown.Item
									key="changeTheme"
									icon={
										type === "dark" ? (
											<SunIcon style={{ height: "var(--icon-size-s)" }} />
										) : (
											<MoonIcon style={{ height: "var(--icon-size-s)" }} />
										)
									}
								>
									{type === "dark" ? "Light" : "Dark"} mode
								</Dropdown.Item>
								<Dropdown.Item
									key="signOut"
									icon={
										<ArrowLeftOnRectangleIcon
											style={{ height: "var(--icon-size-s)" }}
										/>
									}
								>
									Sign out
								</Dropdown.Item>
							</Dropdown.Section>
						</Dropdown.Menu>
					</Dropdown>
				</Navbar.Item>
				<ExportModal
					open={exportModal}
					oncloseHandler={closeHandler}
					closeHandler={exportNoteHandler}
				/>
				<DeleteModal
					open={deleteModal}
					closeHandler={closeHandler}
					deleteHandler={deleteNoteHandler}
					type="note"
				/>
			</Navbar.Content>
		</Navbar>
	);
};

export default NoteNavbar;
