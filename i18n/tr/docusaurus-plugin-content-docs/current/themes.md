# Uzantılar

Flarum'u olabildiğince güzel hale getirmek için çok çalışmış olsak da, her topluluk muhtemelen arzu ettikleri stile uyacak bazı ince ayarlar/değişiklikler yapmak isteyecektir.

## Yönetici Gösterge Tablosu

[Yönetici gösterge tablosu](admin.md)'nun Görünüm sayfası, forumunuzu özelleştirmeye başlamak için harika bir ilk yerdir. Burada yapabilirsin:

- Tema renklerini seçin
- Karanlık modu ve renkli üstbilgi değiştir
- Bir logo ve favicon yükleyin (tarayıcı sekmelerinde gösterilen simge)
- Özel üstbilgiler ve altbilgiler için HTML ekleyin
- Öğelerin görüntülenme şeklini değiştirmek için [özel LESS/CSS](#css-theming) ekleyin

## FontAwesome

Flarum uses FontAwesome 7 for icons throughout the interface. By default the Free icon set is bundled and served locally, but this can be switched to a CDN or a FontAwesome Kit (which unlocks Pro icons and custom icons) via the [advanced settings](admin.md) in the admin dashboard, or directly in [config.php](config.md).

See the [FontAwesome](fontawesome.md) page for full details on configuration options and available icon styles.

## CSS Tema Oluşturma

CSS, tarayıcılara bir web sayfasının öğelerinin nasıl görüntüleneceğini söyleyen bir stil sayfası dilidir.
Renklerden yazı tiplerine, eleman boyutuna ve konumlandırmadan animasyonlara kadar her şeyi değiştirmemizi sağlar.
Özel CSS eklemek, Flarum kurulumunuzu bir temayla eşleşecek şekilde değiştirmenin harika bir yolu olabilir.

Bir CSS eğitimi bu belgesinin kapsamı dışındadır, ancak CSS'nin temellerini öğrenmek için birçok harika çevrimiçi kaynak vardır.

:::tip

Flarum aslında LESS kullanır, bu da değişkenlere, koşullara ve işlevlere izin vererek CSS yazmayı kolaylaştırır.

:::

## Uzantılar

Flarum'un esnek [uzantı sistemi](extensions.md), Flarum'un herhangi bir parçasını pratik olarak eklemenize, çıkarmanıza veya değiştirmenize olanak tanır.
Renkleri/boyutları/stilleri değiştirmenin ötesinde önemli tema değişiklikleri yapmak istiyorsanız, kesinlikle gitmenin yolu özel bir uzantıdır.
Bir uzantının nasıl oluşturulacağını öğrenmek için [uzantı belgelerimize](extend/README.md) göz atın!
