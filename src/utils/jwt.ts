import jwt from 'jsonwebtoken'


// TODO: move to config file
const JWT_SECRET = 'some-very-very-secret-string-no-one-can-guess'

export async function sign(email: any): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign({
        email: email
      }, JWT_SECRET, (err: any, encoded: string | undefined) => {
        if (err) return reject(err)
        else {
          resolve(encoded as string)
        }
      })
    })
  }
  
  export async function decode(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
  
      jwt.verify(token, JWT_SECRET, (err: any, decoded: object | undefined) => {
  
        if (err) return reject(err)
        else return resolve(decoded)
  
      })
  
  
    })
  }