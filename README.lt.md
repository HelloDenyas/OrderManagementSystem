[English](README.md) | [Lietuvių](README.lt.md)

# Užsakymų valdymo sistema

## Apie projektą

Žiniatinklio programa, skirta administratoriams valdyti klientus, prekes ir užsakymus.
Vartotojo sąsaja yra lietuvių kalba, joje pateikiama sistemos duomenų apžvalga.

## Funkcionalumas

- Administratoriaus prisijungimas ir atsijungimas.
- Klientų kūrimas, redagavimas, trynimas ir paieška.
- Prekių kūrimas, redagavimas ir trynimas.
- Užsakymo kūrimas pasirinktam klientui su keliomis prekėmis.
- Automatinis užsakymo sumos skaičiavimas.
- Užsakymų būsenos: Naujas, Vykdomas, Įvykdytas ir Atšauktas.
- Apžvalga su klientų, prekių ir užsakymų skaičiais.
- Duomenų tikrinimas vartotojo sąsajoje ir serverio dalyje.

## Technologijos

- ASP.NET Core / .NET 10
- Entity Framework Core
- PostgreSQL
- React + TypeScript
- Vite
- xUnit

## Architektūra

Sistemos veikimo schema: React frontend → ASP.NET Core Web API → EF Core → PostgreSQL.
Pagrindiniai ryšiai: Customer → Orders → OrderItems → Products. Klientas gali turėti kelis užsakymus, o kiekviename užsakyme yra su prekėmis susietos eilutės.

## Paleidimas

Visos žemiau pateiktos komandos skirtos vykdyti Windows PowerShell terminale iš pagrindinio projekto aplanko, nebent aiškiai nurodyta kita vieta.
Pagrindinis projekto aplankas yra tas aplankas, kuriame matomi `backend` ir `frontend` aplankai.
Prieš pradėdami įdiekite .NET 10 SDK, Node.js 22.12 arba naujesnę versiją su npm ir PostgreSQL.

### 1. Atidarykite projekto aplanką

Failų naršyklėje atidarykite aplanką, kuriame yra `backend` ir `frontend`.
Adreso juostoje įrašykite `powershell` ir paspauskite Enter – terminalas atsidarys šiame aplanke.
Kopijuokite po vieną komandą ir spauskite Enter. Atlikdami paruošimo veiksmus palaukite, kol komanda baigs veikti, prieš vykdydami kitą.

### 2. Sukurkite PostgreSQL duomenų bazę

Įsitikinkite, kad PostgreSQL veikia. Duomenų bazės valdymo įrankiu sukurkite tuščią duomenų bazę, pavyzdžiui, `order_management_db`.
Jei naudojate pgAdmin, prisijunkite prie serverio, dešiniuoju pelės mygtuku spustelėkite **Databases**, pasirinkite **Create → Database**, įrašykite pavadinimą ir spustelėkite **Save**.
Kitam žingsniui pasiruoškite duomenų bazės pavadinimą, serverio adresą, prievadą, naudotojo vardą ir slaptažodį.

### 3. Sukonfigūruokite prisijungimą prie duomenų bazės

PowerShell komandoje vietoje kiekvieno `<...>`, įskaitant kampinius skliaustus, įrašykite savo PostgreSQL reikšmes. Kabutes palikite.
Naudokite savo PostgreSQL prievadą. Ši komanda išsaugo prisijungimo nustatymus .NET User Secrets.

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<host>;Port=<port>;Database=<database>;Username=<username>;Password=<database-password>" --project backend/OrderManagement.Api
```

### 4. Sukonfigūruokite administratorių

Pasirinkite prisijungimo vardą ir vietoje `<your-password>` įrašykite savo slaptažodį. Pavyzdinis naudotojo vardas yra `admin`.

```powershell
dotnet user-secrets set "Admin:Username" "admin" --project backend/OrderManagement.Api
dotnet user-secrets set "Admin:Password" "<your-password>" --project backend/OrderManagement.Api
```

Paskyra sukuriama paleidus API, jei administratoriaus dar nėra. Šie nustatymai neperrašo esamos paskyros.

### 5. Atkurkite įrankius ir priklausomybes

Abi komandas vykdykite iš pagrindinio projekto aplanko ir palaukite, kol jos baigs veikti:

```powershell
dotnet tool restore --tool-manifest dotnet-tools.json
dotnet restore backend/OrderManagement.Api/OrderManagement.Api.csproj
```

### 6. Pritaikykite migracijas

Sukurkite programos lenteles 3 žingsnyje nurodytoje duomenų bazėje:

```powershell
dotnet ef database update --project backend/OrderManagement.Api --startup-project backend/OrderManagement.Api -- --environment Development
```

### 7. Paleiskite serverio dalį

```powershell
dotnet run --project backend/OrderManagement.Api --launch-profile http
```

Palaukite, kol terminale pasirodys pranešimas, kad API veikia adresu `http://localhost:5212`.
Palikite šį terminalą atidarytą. API veikia Development režimu ir įkelia jūsų User Secrets.

### 8. Paleiskite vartotojo sąsają

Atidarykite antrą PowerShell terminalą pagrindiniame projekto aplanke, kaip 1 žingsnyje.
Pirmoji komanda pereina į `frontend` aplanką; likusias komandas vykdykite jame:

```powershell
cd frontend
npm install
npm run dev
```

Šį terminalą taip pat palikite atidarytą. Vite persiunčia vartotojo sąsajos `/api` užklausas į `http://localhost:5212`.

### 9. Atidarykite programą ir prisijunkite

Naršyklėje atidarykite Vite parodytą vietinį adresą.
Prisijunkite su 4 žingsnyje nustatytu administratoriaus vardu ir slaptažodžiu.

### 10. Pasirinktinai: paleiskite testus

Serverio dalies terminale paspauskite `Ctrl+C`, kad ją sustabdytumėte, tada iš pagrindinio projekto aplanko vykdykite žemiau, skyriuje **Testai**, pateiktą komandą.
Norėdami patikrinti vartotojo sąsają, sustabdykite jos terminale veikiančią programą paspausdami `Ctrl+C`, tada aplanke `frontend/` vykdykite `npm run lint` arba `npm run build`.

## Testai

Vykdykite iš pagrindinio projekto aplanko:

```powershell
dotnet test backend/OrderManagement.Api.Tests/OrderManagement.Api.Tests.csproj
```

Testai apima duomenų tikrinimą, prisijungimą, prekes ir užsakymus. Integraciniuose testuose naudojama atmintyje veikianti SQLite duomenų bazė.

## Pastabos

- Užsakymų sumas apskaičiuoja serverio dalis.
- Kuriant užsakymus tikrinamas prekių likutis, tačiau jis automatiškai nemažinamas.
- Slaptažodžių ir kitų slaptų duomenų nereikėtų įtraukti į repozitoriją.
