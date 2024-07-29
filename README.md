# ClickUp Helper

This is a fetch wrapper that provides a few methods for getting spaces, folders, lists, and tasks from the ClickUp API. Currently, does not support updating / creating anything (POST requests) via the API.

## Usage

`npm i clickup-helper`

```js
import { ClickUpHelper } from "clickup-helper";
const clickup = new ClickUpHelper("CLICKUP_API_KEY");
const tasks = await clickup.getTeamData(["spaceID1", "spaceID2"]);
console.log(tasks.length);
```
