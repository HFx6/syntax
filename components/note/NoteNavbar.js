import SettingsModal from "@/components/modal/SettingsModal";
import ExportModal from "@/components/modal/ExportModal";
import DeleteModal from "@/components/modal/DeleteModal";
import { Avatar, Dropdown, Button, Navbar } from "@nextui-org/react";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic'
import {
	EllipsisHorizontalIcon,
	TrashIcon,
	ShareIcon,
	LockClosedIcon,
	DocumentArrowUpIcon,
	ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import {
	useNote,
	useDispatchNote,
	useNotes,
	useDispatchNotes
} from "../../modules/AppContext";


  

const NoteNavbar = ({ sidebarDisplay, handleSidebarDisplay }) => {
	const [selectedKey, setSelectedKey] = useState();
	const [settingsModal, setSettingsModal] = useState(false);
	const [exportModal, setExportModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const currentNote = useNote();
	const setNotes = useDispatchNotes();

	const closeHandler = () => {
		setSettingsModal(false);
		setExportModal(false);
		setDeleteModal(false);
		setSelectedKey();
	};

	const deleteNoteHandler = async () => {
		try {
			console.log(currentNote);
			let res = await fetch(`/api/note`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(currentNote.id),
			});
			const deletedNote = await res.json();
			setNotes({ note: deletedNote, type: "remove" });
			setDeleteModal(false);
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
				const res = await fetch(`/api/note/${currentNote.id}/export/html`, {
					method: "GET",
				});
				let {text} = await res.json()
				const html2pdf = (await import("html-to-pdf-js")).default
				html2pdf().from(text).save(`${currentNote.title}`)
			}
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		switch (selectedKey) {
			case "export":
				setExportModal(true);
				break;
			case "delete":
				setDeleteModal(true);
				break;
		}
	}, [selectedKey]);



	return (
		<Navbar
			variant="sticky"
			disableShadow
			disableBlur
			css={{ "z-index": 2 }}
			containerCss={{
				"min-width": "100%",
			}}
		>
			<Navbar.Content>
				<Navbar.Item>
					<Button
						auto
						light
						animated={false}
						onPress={handleSidebarDisplay}
						icon={
							<ChevronDoubleRightIcon style={{ height: "var(--icon-size)" }} />
						}
						css={{ display: sidebarDisplay ? "flex" : "none" }}
					/>
				</Navbar.Item>
			</Navbar.Content>
			<Navbar.Content gap={5}>
				<Navbar.Item>
					<Button
						auto
						light
						animated={false}
						onPress={setSettingsModal}
						icon={
							<Avatar
								src="https://cdn3.emoji.gg/emojis/3568-catkiss.gif"
								css={{ cursor: "pointer" }}
							/>
						}
					/>
				</Navbar.Item>
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
							<Dropdown.Item
								key="share"
								icon={<ShareIcon style={{ height: "var(--icon-size-s)" }} />}
							>
								Share
							</Dropdown.Item>
							<Dropdown.Item
								key="lock"
								icon={<LockClosedIcon style={{ height: "var(--icon-size-s)" }} />}
							>
								Lock
							</Dropdown.Item>
							<Dropdown.Item
								key="export"
								icon={<DocumentArrowUpIcon style={{ height: "var(--icon-size-s)" }} />}
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
						</Dropdown.Menu>
					</Dropdown>
				</Navbar.Item>
				<ExportModal open={exportModal} oncloseHandler={closeHandler} closeHandler={exportNoteHandler} />
				<DeleteModal open={deleteModal} onclosehandler={closeHandler} closeHandler={deleteNoteHandler} />
				<SettingsModal open={settingsModal} closeHandler={closeHandler} />
			</Navbar.Content>
		</Navbar>
	);
};

export default NoteNavbar;
