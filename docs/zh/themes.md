# 样式主题

尽管我们一直在努力使 Flarum 变得尽可能美丽，但每个社区可能都希望进行一些调整/修改，以适合他们所需的风格。

## 管理面板

[管理面板](../admin.md) 的「外观」页面是开始定制论坛的理想之地。 在这里，您可以：

- 选择主题颜色
- 切换夜间模式和彩色导航栏。
- 上传标志和站点图标（浏览器标签中显示的图标）。
- 在自定义页眉和页脚添加 HTML。
- 添加 [自定义LESS/CSS](#css-主题) 来改变元素的显示方式。

## CSS 主题

CSS 是一种样式表语言，它告诉浏览器如何显示网页的元素。 它允许我们修改所有的东西，从颜色到字体到元素的大小，从定位到动画等等。 添加自定义 CSS 是修改您的 Flarum 默认主题的好方法。

CSS 教程不在本文档的讨论范围之内，但是有大量的优质在线资源可供您学习 CSS 的基础知识。

:::tip

Flarum actually uses LESS, which makes it easier to write CSS by allowing for variables, conditionals, and functions.

:::

## 扩展

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum. If you want to make substantial theming modifications beyond changing colors/sizes/styles, a custom extension is definitely the way to go. To learn how to make an extension, check out our [extension documentation](extend/README.md)!
