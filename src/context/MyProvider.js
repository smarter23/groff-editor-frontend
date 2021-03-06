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
		// this.guest = localStorage.getItem("Guest");
		// this.apiUrl = "https://groffapi.dscvit.com/";
		this.apiUrl = options.apiUrl;
	}
	state = {
		LoggedIn: false,
		Loaded: false,
		DarkMode: false,
		documents: [
			{
				fileName: "Example Document",
				fileId: "doc1",
				time: "12 Hours Ago",
				fileData: "This is an example file",
			},
		],
	};
	backup = {};
	ContextMutator = (e) => {
		if (e === "DarkMode") this.setState({ DarkMode: !this.state.DarkMode });
	};

	ConvertDate = (epoch) => {
		var created_date = new Date(epoch);

		var months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		var year = created_date.getFullYear();
		var month = months[created_date.getMonth()];
		var date = created_date.getDate();
		var time = date + " " + month + " " + year;
		return time;
	};

	LoadAllDocuments = () => {
		// this.guest = localStorage.getItem("Guest");
		// if (this.guest === "Yes") {
		// 	this.setState({ Loaded: true });
		// }
		var status = 200;
		if (!this.state.Loaded) {
			this.token = localStorage.getItem("token");
			this.userId = localStorage.getItem("user-id");
			fetch(this.apiUrl + "preview/user", {
				method: "GET",
				headers: {
					Authorization: this.token,
				},
			})
				.then((data) => {
					if (data.status === 200) {
						status = 200;
						return data.json();
					} else {
						status = 500;
						// localStorage.removeItem("token");
						console.log("Loading Failed");
						console.log(data.json);
						// window.location.reload(false);
						return data.json();
					}
				})
				.then((data) => {
					console.log(status);
					if (status === 200) {
						const files = data.searches[0].files.filter((file) => {
							file.time = this.ConvertDate(
								file.timestamps.updatedAt
							);
							return file;
						});
						this.setState({
							Loaded: true,
							documents: [...files],
						});
						this.backup = [...files];
					}
				});
		}
	};
	NewDocumentHandler = () => {
		// if (this.guest !== "Yes") {
		return new Promise((resolve, reject) => {
			fetch(this.apiUrl + "preview/createFile/", {
				method: "PATCH",
				headers: {
					Authorization: this.token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fileName: "New Document",
					fileData:"This is a New File"
				}),
			})
				.then((data) => data.json())
				.then((data) => {
					data.created.time = this.ConvertDate(
						data.created.timestamps.updatedAt
					);
					this.setState({
						documents: [...this.state.documents, data.created],
					});
					resolve(data.created.fileId);
				});
		});
		// } else {
		// 	let newDoc = {
		// 		fileName: "NewDocument",
		// 		time: "Today",
		// 		fileData: "hello",
		// 		fileId: "newDoc",
		// 		_id: "newDoc",
		// 	};
		// 	this.setState({
		// 		documents: [...this.state.documents, newDoc],
		// 	});
		// }
	};
	TDocumentHandler = (content, title) => {
		console.log("TEMPLATE", content, title);
		// if (this.guest !== "Yes") {
		return new Promise((resolve, reject) => {
			fetch(this.apiUrl + "preview/createFile/", {
				method: "PATCH",
				headers: {
					Authorization: this.token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fileName: title,
					fileData: content,
				}),
			})
				.then((data) => data.json())
				.then((data) => {
					data.created.time = this.ConvertDate(
						data.created.timestamps.updatedAt
					);
					console.log(data);
					// let tdata = {
					//   fileData: content,
					//   fileId: data.created.fileId,
					//   fileName : "Title",
					//   time: data.created.time,
					//   timestamps: data.created.timestamps
					// }
					this.setState({
						documents: [...this.state.documents, data.created],
					});
					resolve(data.created.fileId);
				});
		});
		// } else {
		// 	return new Promise((resolve, reject) => {
		// 		let newDoc = {
		// 			fileName: title,
		// 			time: "Today",
		// 			fileData: content,
		// 			fileId: "newDoc",
		// 			_id: "newDoc",
		// 		};
		// 		this.setState({
		// 			documents: [...this.state.documents, newDoc],
		// 		});
		// 		resolve(newDoc.fileId);
		// 	});
		// }
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
				console.log("state updated", this.state.Loaded);
				this.LoadAllDocuments();
				console.log("state updated", this.state.Loaded);
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
					TDocumentHandler: (content, title) =>
						this.TDocumentHandler(content, title),
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
