# RantStats Extension for Rumble.com

## 1.4.5

-   Open options page when clicking icon instead of popup
-   Options page design, re-work logging, general cleanup
-   Add option to disable alternate colors in chat
-   Only enable save button when option changed
-   Fix open chat button due to Rumble change
-   Add context menu to open sidebar when button is missing due to Rumble changes

Resolved:

-   [Issue #16](https://github.com/rantstats/rantstats-extension/issues/16)

## 1.4.4

-   Hide console messages for release build

## 1.4.3

-   Update message sending in order to handle errors
    -   Change open tabs to map and use tab id as key
    -   If message fails to send to tab, remove tab from cache map
-   Fix button to show cached rants not showing for livestream playback
-   Fix options not receiving updates

## 1.4.2

Detect new class name used for chat list

Resolved:

-   [Issue #11](https://github.com/rantstats/rantstats-extension/issues/11)

## 1.4.1

Fix color theme detection

Resolved:

-   [Issue #9](https://github.com/rantstats/rantstats-extension/issues/9)

## 1.4.0

Add support for showing user's badges and channel subscribers

-   Store possible badges to cache
-   Stores badges active for user during rant in cache
-   Show badges active for user next to the username
-   Stores the "notification" information in cache
-   New entry for "notifications"
-   Show placeholder for users without image
-   Swap colors to match how Rumble uses them

Resolves:

-   [Issue #6](https://github.com/rantstats/rantstats-extension/issues/6)
-   [Issue #7](https://github.com/rantstats/rantstats-extension/issues/7)

## 1.3.0

Add support for displaying button to open rants from popup chat

## 1.2.0

Update button for opening sidebar and cached rants to match new Rumble design
([Issue #1](https://github.com/rantstats/rantstats-extension/issues/1))

## 1.1.0

Fix errors and refresh issues

## 1.0.0

Initial release
