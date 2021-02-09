// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { privateEncrypt } from "crypto";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // console.log('Congratulations, your extension "myjournal" is now active!');

  let disposable = vscode.commands.registerCommand(
    "myjournal.openJournal",
    () => {
      const filePath = generateFileName(getFirstDayOfWeek());
      var openPath = vscode.Uri.file(filePath);
      vscode.workspace.openTextDocument(openPath).then(
        (doc) => {
          vscode.window.showTextDocument(doc);
        },
        (doc) => {
          fs.writeFileSync(filePath, generateCalendarThisWeek(), "utf8");
          vscode.window.showTextDocument(doc);
          vscode.workspace.openTextDocument(openPath).then((doc) => {
            vscode.window.showTextDocument(doc);
          });
        }
      );
      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello World from myjournal!");
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getRootDir(): string{
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("myjournal");
	let rootDir = config.get("rootDirectory", "");
	if (rootDir === ""){
		rootDir = require('os').homedir() + "/myjournal";
	}

  if (!fs.existsSync(rootDir)){
      fs.mkdirSync(rootDir);
  }

	return rootDir;
}

function getFirstDayOfWeek(): Date {
  let today = new Date();
  if (today.getDay() === 0) {
    // 日曜だったら前日の土曜日ということにする
    today = new Date(
      today.getTime() - (today.getDay() - 1) * 60 * 60 * 24 * 1000
    );
  }

  const firstDay = new Date(
    today.getTime() - (today.getDay() - 1) * 60 * 60 * 24 * 1000
  );

  return firstDay;
}

function generateFileName(firstDay: Date): string {
  const dir = getRootDir() + "/" + format(firstDay, "yyyy");
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

	return dir + "/" + format(firstDay, "yyyyMMdd") + ".md";
  }

function generateFileNameRelative(firstDay: Date): string {
	return "../../" + + format(firstDay, "yyyy") + "/" + format(firstDay, "yyyyMMdd") + ".md";
}
  
function generateCalendarThisWeek(): string {
  const firstDay = getFirstDayOfWeek();
  const lastDay = new Date(firstDay.getTime() + 6 * 60 * 60 * 24 * 1000);

  let retStr = "";
  retStr +=
    "# " +
    format(firstDay, "yyyyMMdd") +
    " - " +
    format(lastDay, "yyyyMMdd") +
    "\n\n";

	const lastWeek = new Date(firstDay.getTime() -7 * 60 * 60 * 24 * 1000);
	const nextWeek = new Date(firstDay.getTime() + 7 * 60 * 60 * 24 * 1000);
	retStr += "- [Last Week](" + generateFileNameRelative(lastWeek)+ ")\n";
	retStr += "- [Next Week](" + generateFileNameRelative(nextWeek)+ ")\n\n";

  retStr += "## To Do\n\n";

  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDay.getTime() + i * 60 * 60 * 24 * 1000);
    retStr += "## " + format(day, "yyyyMMdd") + "\n\n";
  }

  return retStr;
}
