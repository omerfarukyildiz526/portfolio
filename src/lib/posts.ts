export interface ContentBlock {
  type: 'p' | 'h2' | 'h3' | 'code' | 'list' | 'note' | 'quote' | 'image' | 'divider';
  text?: string;       // p, h2, h3, note, code, quote, image(başlık/caption)
  items?: string[];    // list
  lang?: string;       // code
  url?: string;        // image
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  gradient: [string, string];
  symbol: string;
  tags: string[];
  date: string;
  readTime: number;
  content: ContentBlock[];
  published?: boolean; // tanımsız = yayında (eski yazılarla uyum için)
  cover?: string;      // kapak görseli URL'si (opsiyonel)
}

// Başlangıç içeriği. Veritabanı boşsa bu yazılar otomatik olarak MongoDB'ye
// aktarılır (bkz. src/lib/posts-db.ts → getAllPosts). Sonrasında tek doğruluk
// kaynağı veritabanıdır; bu dizi yalnızca ilk tohumlama içindir.
export const SEED_POSTS: Post[] = [
  {
    slug: 'python-selenium-otomasyon',
    title: 'Python + Selenium ile Web Otomasyonu',
    excerpt: 'Selenium WebDriver kurulumundan gerçek dünya RPA senaryolarına kadar adım adım rehber.',
    gradient: ['#0d1433', '#1a2a6c'],
    symbol: '🐍',
    tags: ['Python', 'Selenium', 'RPA'],
    date: '2025-03-10',
    readTime: 6,
    content: [
      { type: 'p', text: 'Selenium, tarayıcıyı kod ile kontrol etmeni sağlayan en güçlü web otomasyon kütüphanelerinden biridir. Python ile birlikte kullanıldığında tekrarlayan web işlemlerini tamamen otomatikleştirebilirsin.' },
      { type: 'h2', text: 'Kurulum' },
      { type: 'code', lang: 'bash', text: 'pip install selenium\npip install webdriver-manager' },
      { type: 'h2', text: 'İlk Tarayıcı Açma' },
      { type: 'code', lang: 'python', text: `from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://example.com")
print(driver.title)
driver.quit()` },
      { type: 'h2', text: 'Element Bulma Yöntemleri' },
      { type: 'list', items: [
        'find_element(By.ID, "id") — ID ile arama',
        'find_element(By.CSS_SELECTOR, ".class") — CSS selector',
        'find_element(By.XPATH, "//div[@class=\'x\']") — XPath',
        'find_element(By.NAME, "username") — name attribute',
      ]},
      { type: 'h2', text: 'Form Doldurma Örneği' },
      { type: 'code', lang: 'python', text: `from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
username = wait.until(EC.presence_of_element_located((By.ID, "username")))
username.send_keys("ofaruk")

password = driver.find_element(By.ID, "password")
password.send_keys("sifre123")

driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()` },
      { type: 'note', text: 'WebDriverWait kullanımı önemli. Sayfanın yüklenmesini beklemeden element aramak sık karşılaşılan hataların başında gelir.' },
      { type: 'h2', text: 'Headless Mod — Arka Planda Çalıştırma' },
      { type: 'code', lang: 'python', text: `from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)` },
    ],
  },
  {
    slug: 'csharp-rest-api',
    title: 'C# ile REST API Tasarımı',
    excerpt: '.NET Core Web API ile endpoint tasarımı, middleware, authentication ve response handling.',
    gradient: ['#1a0533', '#3d0f6b'],
    symbol: '⚡',
    tags: ['C#', '.NET', 'Web API'],
    date: '2025-04-02',
    readTime: 7,
    content: [
      { type: 'p', text: '.NET Core ile REST API yazmak son derece hızlı ve yapılandırılmış bir süreçtir. Controller tabanlı yapı, endpoint yönetimini ve bakımını kolaylaştırır.' },
      { type: 'h2', text: 'Proje Oluşturma' },
      { type: 'code', lang: 'bash', text: 'dotnet new webapi -n MyApi\ncd MyApi\ndotnet run' },
      { type: 'h2', text: 'Temel Controller Yapısı' },
      { type: 'code', lang: 'csharp', text: `[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _service.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _service.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}` },
      { type: 'h2', text: 'HTTP Status Code Rehberi' },
      { type: 'list', items: [
        '200 OK — Başarılı GET/PUT işlemi',
        '201 Created — Yeni kaynak oluşturuldu (POST)',
        '204 No Content — Başarılı ama dönecek veri yok (DELETE)',
        '400 Bad Request — İstek gövdesi hatalı',
        '401 Unauthorized — Token yok/geçersiz',
        '404 Not Found — Kaynak bulunamadı',
        '500 Internal Server Error — Sunucu hatası',
      ]},
      { type: 'h2', text: 'Middleware ile Global Hata Yönetimi' },
      { type: 'code', lang: 'csharp', text: `app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<IExceptionHandlerFeature>();
        await context.Response.WriteAsJsonAsync(new
        {
            message = "Sunucu hatası oluştu.",
            detail  = error?.Error.Message
        });
    });
});` },
      { type: 'note', text: 'DTO (Data Transfer Object) kullanmak, entity\'ni doğrudan expose etmekten daha güvenlidir. FluentValidation ile DTO doğrulamasını da ekleyebilirsin.' },
    ],
  },
  {
    slug: 'docker-containerization',
    title: 'Docker ile Uygulamayı Containerize Etme',
    excerpt: 'Dockerfile yazımı, image build, container çalıştırma ve docker-compose ile çoklu servis yönetimi.',
    gradient: ['#001a2d', '#003d6b'],
    symbol: '🐳',
    tags: ['Docker', 'DevOps', 'Container'],
    date: '2025-04-20',
    readTime: 5,
    content: [
      { type: 'p', text: 'Docker, uygulamanı ve tüm bağımlılıklarını bir container içine paketleyerek "bende çalışıyor ama sunucuda çalışmıyor" sorununu ortadan kaldırır.' },
      { type: 'h2', text: 'Temel Kavramlar' },
      { type: 'list', items: [
        'Image — Uygulamanın şablonu (salt okunur)',
        'Container — Image\'dan çalıştırılan canlı örnek',
        'Dockerfile — Image oluşturma talimatları',
        'Docker Hub — Image deposu (npm gibi)',
        'docker-compose — Çoklu container yönetimi',
      ]},
      { type: 'h2', text: '.NET API için Dockerfile' },
      { type: 'code', lang: 'dockerfile', text: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 80
ENTRYPOINT ["dotnet", "MyApi.dll"]` },
      { type: 'h2', text: 'Image Oluşturma ve Çalıştırma' },
      { type: 'code', lang: 'bash', text: `# Image oluştur
docker build -t myapi:latest .

# Container başlat
docker run -d -p 8080:80 --name myapi myapi:latest

# Logları gör
docker logs myapi

# Container'a gir
docker exec -it myapi bash` },
      { type: 'h2', text: 'docker-compose.yml — API + Veritabanı' },
      { type: 'code', lang: 'yaml', text: `version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:80"
    environment:
      - ConnectionStrings__Default=Server=db;Database=mydb;User=sa;Password=Pass123!
    depends_on:
      - db

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "Pass123!"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"` },
      { type: 'note', text: 'Multi-stage build (build + runtime ayrımı) sayesinde final image\'ın boyutu çok küçük olur. SDK image\'ı sadece derleme için kullanılır, çalışma zamanında aspnet image yeterlidir.' },
    ],
  },
  {
    slug: 'sap-abap-rfc',
    title: 'SAP RFC ile Python Entegrasyonu',
    excerpt: 'PyRFC kütüphanesi ile SAP sistemine bağlanma, BAPI çağırma ve veri okuma/yazma.',
    gradient: ['#0d2d00', '#1a5200'],
    symbol: '🔗',
    tags: ['SAP', 'ABAP', 'RFC', 'Python'],
    date: '2025-05-05',
    readTime: 8,
    content: [
      { type: 'p', text: 'SAP sistemleri kurumsal dünyada yaygın olarak kullanılır. Python\'ın pyrfc kütüphanesi sayesinde SAP\'ın RFC (Remote Function Call) arayüzüne doğrudan bağlanabilir ve BAPI\'ları çağırabilirsin.' },
      { type: 'h2', text: 'pyrfc Kurulumu' },
      { type: 'code', lang: 'bash', text: `# SAP NW RFC SDK'nın kurulu olması gerekir
pip install pyrfc` },
      { type: 'h2', text: 'SAP\'a Bağlanma' },
      { type: 'code', lang: 'python', text: `import pyrfc

conn = pyrfc.Connection(
    ashost='sap-server.firma.com',
    sysnr='00',
    client='100',
    user='RFC_USER',
    passwd='sifre'
)

print("Bağlantı başarılı:", conn.alive)` },
      { type: 'h2', text: 'BAPI ile Malzeme Listesi Çekme' },
      { type: 'code', lang: 'python', text: `result = conn.call(
    'BAPI_MATERIAL_GETLIST',
    MATERIAL_GENERAL=[
        {'MATERIAL': '000000000000100001', 'IND_SECTOR': ''}
    ]
)

for mat in result.get('MATNRLIST', []):
    print(f"Malzeme: {mat['MATERIAL']}, Tip: {mat['MATL_TYPE']}")` },
      { type: 'h2', text: 'RFC ile Sipariş Bilgisi Okuma' },
      { type: 'code', lang: 'python', text: `result = conn.call(
    'BAPI_SALESORDER_GETLIST',
    CUSTOMER_NUMBER='0000001234',
    SALES_ORGANIZATION='1000',
)

orders = result.get('SALES_ORDERS', [])
for order in orders:
    print(f"Sipariş: {order['SALES_ORDER']} — Tarih: {order['SALES_ORD_DATE']}")` },
      { type: 'list', items: [
        'RFC_READ_TABLE — Herhangi bir SAP tablosunu okur',
        'BAPI_MATERIAL_GETLIST — Malzeme listesi',
        'BAPI_SALESORDER_GETLIST — Satış siparişleri',
        'BAPI_PO_GETITEMS — Satın alma siparişi kalemleri',
        'SUSR_USER_AUTH_FOR_OBJ_GET — Yetki sorgusu',
      ]},
      { type: 'note', text: 'RFC bağlantıları için ayrı bir teknik kullanıcı (RFC_USER) oluşturman ve yalnızca gerekli yetkileri vermen güvenlik açısından önemlidir.' },
      { type: 'h2', text: 'Bağlantıyı Kapatma' },
      { type: 'code', lang: 'python', text: 'conn.close()' },
    ],
  },
  {
    slug: 'entity-framework-core',
    title: 'Entity Framework Core Temelleri',
    excerpt: 'Code First yaklaşımı, migration, LINQ sorguları ve ilişkisel veri modelleme.',
    gradient: ['#1a0a00', '#3d1a00'],
    symbol: '🗄',
    tags: ['C#', 'EF Core', 'SQL'],
    date: '2025-05-12',
    readTime: 7,
    content: [
      { type: 'p', text: 'Entity Framework Core, C# sınıflarını veritabanı tablolarına dönüştüren ORM (Object-Relational Mapper) kütüphanesidir. SQL yazmak yerine LINQ ile sorgu yazarsın.' },
      { type: 'h2', text: 'Paket Kurulumu' },
      { type: 'code', lang: 'bash', text: `dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools` },
      { type: 'h2', text: 'Model Tanımlama' },
      { type: 'code', lang: 'csharp', text: `public class Order
{
    public int    Id         { get; set; }
    public string OrderNo    { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Total     { get; set; }

    public int    CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}` },
      { type: 'h2', text: 'DbContext' },
      { type: 'code', lang: 'csharp', text: `public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Order>    Orders    { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Order>()
          .HasOne(o => o.Customer)
          .WithMany(c => c.Orders)
          .HasForeignKey(o => o.CustomerId);
    }
}` },
      { type: 'h2', text: 'Migration & Veritabanı Oluşturma' },
      { type: 'code', lang: 'bash', text: `dotnet ef migrations add InitialCreate
dotnet ef database update` },
      { type: 'h2', text: 'Temel LINQ Sorguları' },
      { type: 'code', lang: 'csharp', text: `// Tüm siparişleri getir
var orders = await context.Orders.ToListAsync();

// Filtrele + sırala
var recentOrders = await context.Orders
    .Where(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-30))
    .OrderByDescending(o => o.CreatedAt)
    .ToListAsync();

// İlişkili veri ile getir (JOIN)
var orderWithCustomer = await context.Orders
    .Include(o => o.Customer)
    .Include(o => o.Items)
    .FirstOrDefaultAsync(o => o.Id == orderId);

// Toplam hesapla
var total = await context.Orders
    .Where(o => o.CustomerId == customerId)
    .SumAsync(o => o.Total);` },
      { type: 'note', text: 'N+1 sorgusundan kaçınmak için Include() kullan. Her order için ayrı customer sorgusu çekmek ciddi performans sorunlarına yol açar.' },
    ],
  },
  {
    slug: 'power-automate-is-akisi',
    title: 'Power Automate ile İş Akışı Otomasyonu',
    excerpt: 'Microsoft Power Automate ile tetikleyici tabanlı akışlar, onay süreçleri ve veri entegrasyonu.',
    gradient: ['#00152d', '#002d5e'],
    symbol: '⚙',
    tags: ['Power Automate', 'RPA', 'Microsoft'],
    date: '2025-05-18',
    readTime: 5,
    content: [
      { type: 'p', text: 'Power Automate, Microsoft 365 ekosistemi içindeki uygulamaları ve dış servisleri kod yazmadan bağlamanı sağlar. Özellikle onay süreçleri ve bildirim akışları için idealdir.' },
      { type: 'h2', text: 'Akış Türleri' },
      { type: 'list', items: [
        'Automated Flow — Bir olay tetiklenince başlar (e-posta, form, SharePoint güncelleme)',
        'Instant Flow — Buton ile manuel tetiklenir',
        'Scheduled Flow — Belirli saatte veya aralıkta çalışır',
        'Desktop Flow (RPA) — Masaüstü uygulamaları otomatikleştirir',
      ]},
      { type: 'h2', text: 'Örnek: Yeni Form Girişinde E-posta Bildirimi' },
      { type: 'list', items: [
        '1. Tetikleyici: "When a new response is submitted" (Microsoft Forms)',
        '2. Eylem: "Get response details" — form verilerini çek',
        '3. Koşul: Puan >= 80 ise devam et',
        '4. Eylem: "Send an email (V2)" — yöneticiye bildirim gönder',
        '5. Eylem: "Add a row into a table" — Excel\'e kaydet',
      ]},
      { type: 'h2', text: 'SharePoint Onay Süreci' },
      { type: 'code', lang: 'yaml', text: `Tetikleyici: Yeni SharePoint listesi öğesi eklendi
↓
Eylem: Start and wait for an approval
  - Approvers: manager@firma.com
  - Title: "Onay Bekliyor: " + item.Title
  - Details: item.Description
↓
Koşul: approval.outcome == "Approve"
  ├─ Evet → SharePoint öğesini "Onaylandı" olarak güncelle
  └─ Hayır → Gönderene red bildirimi gönder` },
      { type: 'h2', text: 'Desktop Flow — SAP Veri Girişi' },
      { type: 'list', items: [
        'SAP GUI aç → T-code\'u yaz',
        'Excel\'den satır satır oku',
        'SAP formunu doldur ve kaydet',
        'Sonucu log dosyasına yaz',
        'Hata olursa e-posta gönder',
      ]},
      { type: 'note', text: 'Power Automate Desktop, Selenium\'a iyi bir alternatiftir ancak lisans gerektirir. Windows 10/11\'de ücretsiz sürümü mevcut fakat Premium connector\'lar için lisans şart.' },
    ],
  },
];
