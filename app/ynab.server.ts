import { API as ynabAPI } from "ynab";

let ynab: ynabAPI;

declare global {
    var __ynab__: ynabAPI;
}