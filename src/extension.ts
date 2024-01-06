// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let createPostCommand = vscode.commands.registerCommand('jekyll.create-post', async () => {
		let postTitle = await vscode.window.showInputBox({
			value: '',
			placeHolder: 'enter your post title',
		});


		let categories = await vscode.window.showInputBox({
			value: '',
			placeHolder: 'enter your categories, seperated by commas (,).',
			validateInput: (value) => {
				return '';
			}
		});

		if (postTitle && categories) {
			postTitle = startCase(postTitle);

			let filename = filePrefix() + '-' + postTitle.replaceAll(' ', '-') + '.markdown';
			let templatefile = (await vscode.workspace.fs.readFile(vscode.Uri.file(context.extensionPath + '/src/templates/post.template'))).toString();
			let formattedTemplatefile = templatefile.replaceAll('{{post-title}}', postTitle)
				.replaceAll('{{post-categories}}', categories);

			try {
				if (vscode.workspace.workspaceFolders) {
					let workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath + '/_posts';
					let workspaceFileUri = vscode.Uri.file(workspacePath + '/' + filename);

					await vscode.workspace.fs.writeFile(workspaceFileUri, Buffer.from(formattedTemplatefile))
						.then((doc) => {
							vscode.window.showInformationMessage('File created');
						});
					vscode.workspace.openTextDocument(workspaceFileUri).then((doc) => {
						vscode.window.showTextDocument(doc).then((doc) => {
						});
					});
				}
			} catch (error) {
				vscode.window.showErrorMessage(error.message);
			}
		} else {
			vscode.window.showInformationMessage("Give a filename");

		};
	});

	context.subscriptions.push(createPostCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }

export function filePrefix() {
	const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format();
	const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format();
	const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format();

	const dateString = [year, month, day];

	return dateString.join('-');
}

export function startCase(str: string) {
	return str.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}
