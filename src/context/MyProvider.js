import MyContext from "./MyContext";
import React, { Component } from "react";
import options from "../options";

// Backend Integration: Add route to fetch all documents(Name , Created Time, Id)
// Optimization: Add Fucntion to refresh database

class MyProvider extends Component {
	constructor(props) {
		super(props);
		this.token = localStorage.getItem("token");
		this.userId = localStorage.getItem("user-id");
		this.guest = localStorage.getItem("guest");
		// this.apiUrl = "https://groffapi.dscvit.com/";
		this.apiUrl = options.apiUrl;
	}
	state = {
		LoggedIn: false,
		Loaded: false,
		DarkMode: false,
		documents: [
			{
				name: "Document1",
				id: "doc1",
				time: "12 Hours Ago",
			},
		],
	};
	backup = {};
	ContextMutator = (e) => {
		if (e === "DarkMode") this.setState({ DarkMode: !this.state.DarkMode });
	};
	LoadAllDocuments = () => {
		if (this.guest) this.setState({ Loaded: true });
		if (!this.state.Loaded) {
			this.token = localStorage.getItem("token");
			this.userId = localStorage.getItem("user-id");
			fetch(this.apiUrl + "preview/user", {
				method: "GET",
				headers: {
					Authorization: this.token,
				},
			})
				.then((data) => data.json())
				.then((data) => {
					const files = data.searches[0].files.filter((file) => file);
					console.log("File,", data);
					this.setState({
						Loaded: true,
						documents: [...files],
					});
					this.backup = [...files];
				});
		}
	};
	NewDocumentHandler = () => {
		return new Promise((resolve, reject) => {
			fetch(this.apiUrl + "preview/createFile/", {
				method: "PATCH",
				headers: {
					Authorization: this.token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fileName: "New Document",
					userId: this.userId,
				}),
			})
				.then((data) => data.json())
				.then((data) => {
					this.setState({
						documents: [...this.state.documents, data.created],
					});
					resolve(data.created.fileId);
				});
		});
	};
	RenameHanlder = (fileId, fileName) => {
		fetch(this.apiUrl + "preview/rename", {
			method: "PATCH",
			headers: {
				Authorization: this.token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				newFileName: fileName,
				fileId: fileId,
			}),
		}).then((data) => {
			if (data.status === 200) {
				let documents = this.state.documents;
				documents.forEach((doc, index) => {
					if (doc.fileId === fileId) {
						doc.fileName = fileName;
					}
				});
				this.setState({
					documents: [...documents],
				});
				// let newData = data.json();
				// this.setState({
				// 	documents: [...newData.],
				// });
			}
		});
		// let documents = this.state.documents;
		// documents.forEach((doc, index) => {
		// 	if (doc.fileId === fileId) {
		// 		doc.fileName = fileName;
		// 	}
		// });
		// this.setState({
		// 	documents: [...documents],
		// });
	};
	DeleteDocumentHandler = (fileId) => {
		console.log("file:", fileId);
		fetch(this.apiUrl + "preview/deleteFile", {
			method: "DELETE",
			headers: {
				Authorization: this.token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				fileId: fileId,
			}),
		})
			.then((data) => data.json())
			.then((res) => {
				this.setState({
					Loaded: false,
				});
				this.LoadAllDocuments();
				console.log(res);
			});
	};
	LogoutHandler = () => {
		console.log("Logged out");
		this.setState({ documents: [], Loaded: false });
	};
	SerachHandler = (querry) => {
		if (querry) {
			try {
				let filtered = this.state.documents.filter((name) =>
					name.fileName.includes(querry)
				);
				this.setState({
					documents: [...filtered],
				});
			} catch {}
		} else {
			this.setState({
				documents: [...this.backup],
			});
		}
	};
	render() {
		return (
			<MyContext.Provider
				value={{
					DarkMode: this.state.DarkMode,
					ViMode: this.state.ViMode,
					ContextMutator: this.ContextMutator,
					NewDocumentHandler: () => this.NewDocumentHandler(),
					documents: this.state.documents,
					Logout: () => this.LogoutHandler(),
					LoadAllDocuments: () => this.LoadAllDocuments(),
					DeleteDocumentHandler: (filename) =>
						this.DeleteDocumentHandler(filename),
					loaded: this.state.Loaded,
					SearchHandler: (value) => this.SerachHandler(value),
					RenameHandler: (fileId, fileName) =>
						this.RenameHanlder(fileId, fileName),
				}}
			>
				{this.props.children}
			</MyContext.Provider>
		);
	}
}

export default MyProvider;
