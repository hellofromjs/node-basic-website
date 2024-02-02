const http = require('http')
const url = require('url')
const fs = require('fs')
const replaceTemplate = require('./modules/replaceTemplate')


const host = 'localhost'
const port = 8888
const cartFile = `${__dirname}/data/cart.json`

const mainTpl = fs.readFileSync(`${__dirname}/templates/main.html`, 'utf-8')
const cardTpl = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8')
const productTpl = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')
const navbarTpl = fs.readFileSync(`${__dirname}/templates/navbar.html`, 'utf-8')
const cartTpl = fs.readFileSync(`${__dirname}/templates/cart.html`, 'utf-8')

const data = fs.readFileSync(`${__dirname}/data/products.json`, 'utf-8')
const products = JSON.parse(data)

const server = http.createServer((req, res)=> {
    const { query, pathname } = url.parse(req.url, true)

    switch (pathname) {
        case '/': {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(renderMain())

            break
        }
        case '/product': {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(renderProductPage(query.id))

            break
        }
        case '/cart': {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(renderCart())

            break
        }
        case '/cart/add': {
            cart = getCartData()
            cart.push(products[query.id])
            fs.writeFileSync(cartFile, JSON.stringify(cart));

            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(renderProductPage(query.id))

            break
        }
        default:
            res.writeHead(404, {
                'Content-Type': 'text/html',
            })

            res.end('<h1>Page not found</h2>')
    }
})

server.listen(port, host, () => {
    console.log(`Server is listening on ${host}:${port}`)
})

function renderCart()
{
    return cartTpl
}

function renderMain()
{
    const cardsHtml = products.map(el => replaceTemplate(cardTpl, el)).join('')

    const navbar = navbarTpl.replace(/{%CART_COUNT%}/g, getCartData().length)
    let output = mainTpl.replace('{%NAVBAR%}', navbar)
    output = output.replace('{%PRODUCT_CARDS%}', cardsHtml)

    return output
}

function renderProductPage(id)
{
    const navbar = navbarTpl.replace(/{%CART_COUNT%}/g, getCartData().length)
    let output = productTpl.replace('{%NAVBAR%}', navbar)
    output = replaceTemplate(output, products[id])

    return output
}

function getCartData()
{
    const cartStr = fs.readFileSync(cartFile, 'utf-8')
    return JSON.parse(cartStr)
}