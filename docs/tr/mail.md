# E-posta Yapılandırması

Herhangi bir topluluğun, e-posta doğrulaması, şifre sıfırlama, bildirim ve kullanıcılara yönelik diğer iletişimlere izin vermek için e-posta göndermesi gerekir. Forumunuzu e-posta gönderecek şekilde yapılandırmak, yönetici olarak ilk adımlarınızdan biri olmalıdır: Yanlış bir yapılandırma, kullanıcılar kaydolmaya çalışırken hatalara neden olur.

## Kullanılabilir Sürücüler

Flarum varsayılan olarak birkaç sürücü sağlar, bunlar aşağıda listelenir ve açıklanır. Geliştiriciler ayrıca [uzantılar aracılığıyla özel posta sürücüleri](ext/mail.md) ekleyebilirler.

### SMTP

Bu muhtemelen en yaygın kullanılan e-posta sürücüsüdür ve harici bir SMTP hizmeti için bir ana bilgisayar, bağlantı noktası/şifreleme, kullanıcı adı ve şifre yapılandırmanıza izin verir. Lütfen şifreleme alanının `ssl` veya `tls` olmasını beklediğini unutmayın.

### Posta

`mail` sürücüsü, birçok barındırma sunucusunda bulunan sendmail/postfix e-posta sistemini kullanmaya çalışacaktır. Bunun çalışması için sendmail'i sunucunuza düzgün bir şekilde kurmanız ve yapılandırmanız gerekir.

### Mailgun

Bu sürücü, e-posta göndermek için [Mailgun](https://www.mailgun.com/) hesabınızı kullanır. Mailgun yapılandırmanızdaki etki alanı ve bölgenin yanı sıra gizli bir anahtara ihtiyacınız olacak.

### Günlük

Günlük posta sürücüsü POSTA GÖNDERMEZ ve öncelikle geliştiriciler tarafından kullanılır. Herhangi bir e-postanın içeriğini `FLARUM_ROOT_DIRECTORY/storage/logs` içindeki günlük dosyasına yazar.

## Test E-postası

Bir e-posta yapılandırmasını kaydettikten sonra, yapılandırmanızın çalıştığından emin olmak için yönetici panosunun Posta sayfasındaki "Test Postası Gönder" düğmesini tıklayabilirsiniz. Bir hata görürseniz veya bir e-posta almazsanız, yapılandırmayı ayarlayın ve tekrar deneyin. Herhangi bir hata yoksa, ancak gelen kutunuzda hiçbir şey görünmüyorsa istenmeyen postanızı kontrol ettiğinizden emin olun.