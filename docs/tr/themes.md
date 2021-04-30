# Tema

Flarum'u olabildiğince güzel hale getirmek için çok çalışmış olsak da, her topluluk muhtemelen arzu ettikleri stile uyacak bazı ince ayarlar/değişiklikler yapmak isteyecektir.

## Yönetici Gösterge Paneli

[Yönetici gösterge tablosu](../admin.md)'nda Görünüm sayfası, forumunuzu özelleştirmeye başlamak için harika bir ilk yerdir. Burada yapabilirsin:

- Tema renklerini seçin
- Karanlık modu ve renkli üstbilgi değiştir
- Bir logo ve favicon yükleyin (tarayıcı sekmelerinde gösterilen simge)
- Özel üstbilgiler ve altbilgiler için HTML ekleyin
- Öğelerin görüntülenme şeklini değiştirmek için [özel LESS/CSS](#css-theming) ekleyin

## CSS Tema Oluşturma

CSS, tarayıcılara bir web sayfasının öğelerinin nasıl görüntüleneceğini söyleyen bir stil sayfası dilidir. Renklerden yazı tiplerine, eleman boyutuna ve konumlandırmadan animasyonlara kadar her şeyi değiştirmemizi sağlar. Özel CSS eklemek, Flarum kurulumunuzu bir temayla eşleşecek şekilde değiştirmenin harika bir yolu olabilir.

Bir CSS eğitimi bu belgesinin kapsamı dışındadır, ancak CSS'nin temellerini öğrenmek için birçok harika çevrimiçi kaynak vardır.

:::tip

Flarum actually uses LESS, which makes it easier to write CSS by allowing for variables, conditionals, and functions.

:::

## Uzantılar

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum. If you want to make substantial theming modifications beyond changing colors/sizes/styles, a custom extension is definitely the way to go. To learn how to make an extension, check out our [extension documentation](extend/README.md)!
