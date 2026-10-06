---
image: img/extensions/statistics-share.png
---

# Statistics

![Statistics: a statistics widget on the admin dashboard. Bundled with Flarum 2.0.](/img/docs/extensions/statistics.png)

The Statistics extension (`flarum/statistics`) shows how active your forum is: how many members, discussions and posts it has, and how those numbers change over time. It is a [bundled extension](../extensions.md), and it is enabled by default.

Statistics are only shown to administrators.

:::tip For developers

Any extension can add its own statistics alongside the built-in ones. See [Adding statistics](../extend/statistics.md) for the developer guide.

:::

## Instalación

The extension ships with Flarum and is enabled on new installs. If you have disabled it, enable it again from the **Extensions** page of the admin panel.

If it is not present in your install, require it like any other package:

```bash
composer require flarum/statistics
php flarum cache:clear
```

## The dashboard widget

The **Forum statistics** widget on the admin panel's **Dashboard** shows the total of each statistic. Click **View more statistics** to open the statistics page.

## The statistics page

Open the statistics page with **View more statistics** on the dashboard widget, or from the extension's entry in the admin panel's navigation.

Each statistic has a tile showing:

- its **total**;
- its count for the selected period;
- how much that count has risen or fallen since the period before, as a percentage.

Click a tile to chart that statistic. The chart plots the selected period alongside the period before it, so you can compare the two. Click **Export chart to SVG** to download the chart as an image.

### Periods

Choose the period from the dropdown to the left of the tiles. **Last 7 days** is selected when the page opens.

| Period                                                                     | Charted by |
| -------------------------------------------------------------------------- | ---------- |
| **Today**                                                                  | Hour       |
| **Last 7 days**                                                            | Day        |
| **Previous 7 days**                                                        | Day        |
| **Last 28 days**                                                           | Day        |
| **Previous 28 days**                                                       | Day        |
| **Last 12 months**                                                         | Week       |
| **Choose custom range...** | Day        |

**Choose custom range...** asks for a start and an end date, both included. For a custom range, the tiles show no percentage change.

Days run from midnight to midnight UTC, whatever your forum's or your browser's time zone.

## What is counted

| Statistic       | What it counts                                                                                                                                         | Dated by                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **Users**       | Every member account, whether or not its email address has been confirmed.                                                             | When the member joined.          |
| **Discussions** | Every discussion, including hidden and private ones.                                                                                   | When the discussion was started. |
| **Posts**       | Every comment post, including hidden and private ones. Event posts, such as "renamed the discussion", are not counted. | When the post was made.          |

The statistics count what is in your forum's database, not what visitors can see, so hidden and private content is included. Content that has been deleted permanently is no longer counted, so totals and past counts can go down.

Other extensions can add their own statistics, which appear after the built-in ones. For example, the Messages extension (`flarum/messages`) adds:

| Statistic      | What it counts                                                      | Dated by                                       |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| **PM started** | Every private conversation.                         | When the conversation started. |
| **PM replies** | Every private message after a conversation's first. | When the message was sent.     |

## How current the numbers are

So that the statistics stay fast on large forums, the numbers are kept for a short time before they are counted again:

| Numbers                                | Counted again after              |
| -------------------------------------- | -------------------------------- |
| Totals                                 | 5 minutes                        |
| Counts for the periods in the dropdown | 15 minutes                       |
| Counts for a custom range              | Counted each time you choose one |

Clearing the cache, with **Clear Cache** on the dashboard or `php flarum cache:clear`, counts everything again the next time the statistics are opened.
