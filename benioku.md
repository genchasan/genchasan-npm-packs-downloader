# NPM Paket İndiricisi ve Yayincisi

Bu projede, belirli bir paketin ve bağımlılıklarının versiyonlarını sorgulayabilir, indirebilir ve Nexus npm registry'ye yükleyebilirsiniz.

## Geliştirme

Proje geliştirme için aşağıdaki adımları takip edebilirsiniz:

1. Projeyi klonlayın:
    ```
    git clone https://github.com/genchasan/npm-packs-downloader.git
    ```

2. Projeyi kurun:
    ```
    cd yourproject
    npm install
    ```

## Kullanım

Projenize npm-packs-download paketini ekleyerek, projenizde kullanılan paketleri indirebilir ve yerel bir Nexus npm registry'ye yükleyebilirsiniz.

### Paket Ekleme

```
npm install --save-dev npm-packs-downloader
```

### Paketleri İndirme ve Yükleme

Proje, belirli bir paketin ve bağımlılıklarının versiyonlarını sorgulamak için kullanılabilir. Aşağıdaki komutları kullanabilirsiniz:

- Bütün komut parametrelerini görmek için:
    ```
    npm-packs-download --help
    ```

- Paketlerin ve bağımlılıklarının listesini almak için:
    ```
    npm-packs-download list
    ```

- Paketleri ve bağımlılıklarını indirmek için:
    ```
    npm-packs-download download
    ```

- Paket listesini bir dosyaya yazmak için:
    ```
    npm-packs-download write-to-file
    ```

- package-lock.json dosyasındaki paketleri indirmek için:
    ```
    npm-packs-download lock-file
    ```

## Nexus npm Registry'ye Yükleme

Paketleri Nexus npm registry'ye yüklemek için `publish-nexus` betiğini kullanabilirsiniz. Bu betik daha önce npm-packs-download ile indirilen `./modules/` dizinindeki tüm npm `.tgz` dosyalarını belirtilen registry'ye yükler.

```
./publish-nexus.sh http://localhost:8081/repository/npm-hosted <username> <password>
```