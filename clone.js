const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const appDir = path.join(__dirname, "app");

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

const isResourceToIgnore = (
  resourceUrl,
  response,
  resourceType,
  requestMethod
) => {
  const ignore =
    resourceUrl.includes("analytics.js") ||
    (response.status() >= 300 && response.status() < 400) ||
    resourceType === "xhr" ||
    resourceType === "fetch" ||
    resourceType === "document" ||
    requestMethod === "OPTIONS" ||
    resourceUrl.endsWith("/");

  if (ignore) {
    console.log(`Ignorando recurso: ${resourceUrl}`);
  }

  return ignore;
};

const saveImage = (resourceUrl) => {
  try {
    const base64Data = resourceUrl.split(",")[1];
    const imgBuffer = Buffer.from(base64Data, "base64");
    const imgName = `image_${Date.now()}.png`;
    const imgPath = path.join(appDir, imgName);
    fs.writeFileSync(imgPath, imgBuffer);
    console.log(`Imagem criada: ${imgPath}`);
  } catch (error) {
    console.error(`Erro ao salvar imagem: ${error}`);
  }
};

const saveFile = (resourceUrl, buffer) => {
  try {
    let url = new URL(resourceUrl);
    let pathname = url.pathname;
    if (pathname.includes(".")) {
      pathname = path.basename(pathname);
    }
    let dest = path.join(appDir, pathname);
    if (!dest.endsWith("/") && dest.includes(".")) {
      console.log(`Copiando arquivo: ${dest}`);
      fs.writeFileSync(dest, buffer);
      console.log(`Arquivo copiado: ${dest}`);
    }
  } catch (error) {
    console.error(`Erro ao salvar arquivo: ${error}`);
  }
};

const downloadResource = async (response, page) => {
  try {
    const resourceUrl = response.url();
    const resourceType = response.request().resourceType();
    const requestMethod = response.request().method();

    if (
      isResourceToIgnore(resourceUrl, response, resourceType, requestMethod)
    ) {
      return;
    }

    if (!page.isClosed()) {
      const buffer = await response.buffer();
      if (resourceUrl.startsWith("data:image")) {
        saveImage(resourceUrl);
      } else {
        saveFile(resourceUrl, buffer);
      }
    }
  } catch (error) {
    console.error(`Erro ao baixar recurso: ${error}`);
  }
};

const downloadSite = async (url) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    page.on("response", async (response) => {
      await downloadResource(response, page);
    });

    console.log(`Carregando página: ${url}`);
    await page.goto(url, { timeout: 1200000 }); // 20 minutos
    console.log(`Página carregada: ${url}`);

    console.log(`Aguardando JavaScript ser carregado`);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // espera 5 segundos
    console.log(`JavaScript carregado`);

    let content = await page.content();
    console.log(`Conteúdo da página obtido, tamanho: ${content.length}`);

    // Incorpora o JavaScript na página HTML
    const scripts = await page.$$eval("script[src]", (nodes) =>
      nodes.map((n) => n.getAttribute("src"))
    );
    for (const script of scripts) {
      const scriptPath = path.join(appDir, script.slice(1)); // remove the leading '/'
      if (fs.existsSync(scriptPath)) {
        const scriptContent = fs.readFileSync(scriptPath, "utf8");
        const scriptPathAdjusted = `.${script}`; // add './' at the beginning
        content = content.replace(
          new RegExp(`<script type="module" src="${script}"></script>`, 'g'),
          `<script type="module" src="${scriptPathAdjusted}">${scriptContent}</script>`
        );
      } else {
        console.log(`Script não encontrado, ignorando: ${scriptPath}`);
      }
    }

    // Atualiza os caminhos para os arquivos CSS
    const styles = await page.$$eval("link[rel='stylesheet']", (nodes) =>
      nodes.map((n) => n.getAttribute("href"))
    );
    for (const style of styles) {
      const stylePath = `.${style}`; // add './' at the beginning
      content = content.replace(new RegExp(`href="${style}"`, 'g'), `href="${stylePath}"`);
    }

    const indexPath = path.join(appDir, "index.html");
    fs.writeFileSync(indexPath, content);
    console.log(`Página salva: ${indexPath}`);
console.log(`Página salva: ${indexPath}`);
  } catch (error) {
    console.error(`Erro ao baixar site: ${error}`);
  } finally {
    if (browser) {
      console.log(`Fechando navegador`);
      await browser.close();
      console.log(`Navegador fechado`);
    }
  }
};

downloadSite("https://pesquisabosch.online/kit-ferramentas/?utm_source=FB&utm_campaign=%5BESC+1-1-1%5D+%5B16%2F06%2F2024%5D+%5BCA+01%5D+%5BBM+01%5D%7C120209606989100239&utm_medium=cj1%7C120209606994030239&utm_content=cv1%7C120209606994170239");

setTimeout(() => {
  console.log("Tempo limite atingido, fechando navegador");
  browser.close();
}, 3 * 60 * 1000);
