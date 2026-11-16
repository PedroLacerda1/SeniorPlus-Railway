import { useEffect, useRef, useState } from "react"
import { useAuth } from "../tela-auth/src/contexts/AuthContext"
import { api } from "../tela-auth/src/services/api"

export default function ProfileImage({ src, alt, onError, ...props }) {
  const { currentUser } = useAuth()
  const imageRef = useRef(null)
  const account = currentUser?.cpf || currentUser?.id || currentUser?.email || null
  const [loaded, setLoaded] = useState({ reference: null, account: null, url: null, error: false })
  const privateImage = typeof src === "string" && src.startsWith("profile-image:")

  useEffect(() => {
    if (!privateImage || !account) return undefined
    let active = true
    let objectUrl
    api.getProfileImage(src).then((blob) => {
      if (!active) return
      objectUrl = URL.createObjectURL(blob)
      setLoaded({ reference: src, account, url: objectUrl, error: false })
    }).catch((error) => {
      if (!active) return
      console.error("Não foi possível carregar a foto de perfil.", error)
      setLoaded({ reference: src, account, url: null, error: true })
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, privateImage, account])

  useEffect(() => {
    if (privateImage && loaded.reference === src && loaded.account === account && loaded.error && imageRef.current) {
      imageRef.current.dispatchEvent(new Event("error"))
    }
  }, [loaded, privateImage, src, account])

  const imageUrl = privateImage ? (loaded.reference === src && loaded.account === account ? loaded.url : null) : src
  return <img {...props} ref={imageRef} src={imageUrl || undefined} alt={alt} onError={onError} />
}
