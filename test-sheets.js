
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')
require('dotenv').config({ path: '.env.production' })

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
]

const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
})

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)

async function testConnection() {
    console.log('Testing connection...')
    console.log('Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID)

    try {
        await doc.loadInfo()
        console.log('Success! Sheet title:', doc.title)
    } catch (error) {
        console.error('Connection failed:', error)
    }
}

testConnection()
