# Sorun Giderme

Flarum beklendiği gibi yüklenmiyorsa veya çalışmıyorsa, yapmanız gereken ilk şey ortamınızın [sistem gereksinimlerini](install.md#sunucu-gereksinimleri) karşılayıp karşılamadığını *tekrar kontrol etmektir.* Flarum'un çalıştırması gereken bir şeyi kaçırıyorsanız, onu düzeltmeniz gerekir. If you're missing something that Flarum needs to run, you'll need to remedy that first.

Ayrıca, [Destek forumunu](https://discuss.flarum.org/t/support) ve [sorun izleyiciyi](https://github.com/flarum/core/issues) aramak için birkaç dakikanızı ayırmalısınız. Birisi sorunu zaten bildirmiş olabilir ve bir düzeltme mevcut veya yolda. İyice araştırdıysanız ve sorunla ilgili herhangi bir bilgi bulamıyorsanız, sorun gidermeye başlamanın zamanı geldi.

## Step 0: Activate debug mode

:::danger Skip on Production

These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment.

:::

Devam etmeden önce, Flarum'un hata ayıklama araçlarını etkinleştirmelisiniz. Basitçe bir metin düzenleyiciyle **config.php** açın, `debug` değerini `true` olarak değiştirin ve dosyayı kaydedin. Bu, Flarum'un ayrıntılı hata mesajları göstermesine neden olarak size neyin yanlış gittiğine dair bir fikir verecektir.

Boş sayfalar görüyorsanız ve yukarıdaki değişiklik yardımcı olmuyorsa, **php.ini** yapılandırma dosyanızda `display_errors` ı `On` olarak ayarlamayı deneyin.

## 1. Adım: Yaygın düzeltmeler

A lot of issues can be fixed with the following:

* Tarayıcınızın önbelleğini temizleyin
* Arka uç önbelleğini [`php flarum cache:clear`](console.md) ile temizleyin.
* Veritabanınızın [`php flarum migrate`](console.md) ile güncellendiğinden emin olun.
* Yönetici panonuzdaki [e-posta yapılandırmasının](mail.md) doğru olduğundan emin olun: geçersiz e-posta yapılandırması kayıt olurken, parolayı sıfırlarken, e-postaları değiştirirken ve bildirim gönderirken hatalara neden olur.
* `config.php` dosyanızın doğru olup olmadığını kontrol edin. Örneğin, doğru `url` nin kullanıldığından emin olun.
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

Ayrıca önemli hiçbir şeyin yerinde olmadığından emin olmak için [`php flarum info`](console.md) çıktısına da göz atmak isteyeceksiniz.

## 2. Adım: Sorunu yeniden oluşturun

Sorunun yeniden oluşmasını sağlamaya çalışın. Gerçekleştiğinde ne yaptığınıza dikkat edin. Her seferinde mi yoksa sadece ara sıra mı oluyor? Sorunu etkileyebileceğini düşündüğünüz bir ayarı veya bir şeyleri yaptığınız sırayı değiştirmeyi deneyin. Bazı koşullarda olurken diğerleri olmuyor mu?

Yakın zamanda bir uzantı eklediyseniz veya güncellediyseniz, sorunun çözülüp çözülmediğini görmek için geçici olarak devre dışı bırakmalısınız. Tüm uzantılarınızın, çalıştırdığınız Flarum sürümüyle kullanılmak üzere tasarlandığından emin olun. Eski uzantılar, çeşitli sorunlara neden olabilir.

Yol boyunca bir yerlerde sorununuza neyin sebep olduğu hakkında bir fikir edinebilir ve bunu düzeltmenin bir yolunu bulabilirsiniz. Ancak bu olmasa bile, hata raporunuzu doldurduktan sonra, neler olup bittiğini anlamamıza yardımcı olacak birkaç değerli ipucuyla karşılaşacaksınız.

## 3. Adım: Bilgi toplayın

Sorunu çözmek için yardıma ihtiyacınız olacak gibi görünüyorsa, veri toplama konusunda ciddi olmanın zamanı geldi. Aşağıdaki yerlerde hata mesajlarını veya sorunla ilgili diğer bilgileri arayın:

* Asıl sayfada görüntülenir
* Tarayıcı konsolunda görüntülenir (Chrome: Diğer araçlar -> Geliştirici Araçları -> Konsol)
* `/var/log/nginx/error.log`)
* PHP-FPM'nin hata günlüğüne kaydedilir (ör. `/var/log/php7.x-fpm.log`)
* Flarum tarafından kaydedildi (`storage/logs/flarum.log`)

Herhangi bir mesajı bir metin dosyasına kopyalayın ve hatanın *ne zaman* oluştuğu, o sırada *ne yaptığınız* vb. Hakkında birkaç not alın. Sorunun meydana geldiği ve oluşmadığı koşullar hakkında derlemiş olabileceğiniz tüm bilgileri eklediğinizden emin olun. Sunucu ortamınız hakkında olabildiğince fazla bilgi ekleyin: İşletim sistemi sürümü, web sunucusu sürümü, PHP sürümü ve işleyici, vb.

## 4. Adım: Bir rapor hazırlayın

Sorunla ilgili tüm bilgileri topladıktan sonra bir hata raporu vermeye hazırsınız. Lütfen [Hataları Bildirme](bugs.md) ile ilgili talimatları uygulayın.

Raporunuzu doldurduktan sonra sorunla ilgili yeni bir şey keşfederseniz, lütfen bu bilgiyi orijinal yayınınızın altına ekleyin. Sorunu kendi başınıza çözmüş olsanız bile rapor vermek iyi bir fikirdir, çünkü diğer kullanıcılar da çözümünüzden faydalanabilir. Sorun için geçici bir çözüm bulduysanız, bundan da bahsettiğinizden emin olun.