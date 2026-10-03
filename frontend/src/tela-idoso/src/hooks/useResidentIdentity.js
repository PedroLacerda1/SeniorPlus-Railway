import { useMemo } from 'react'

import {
  collectIdentitySources,
  normalizeIdentifierDigits,
  resolveResidentCpf,
  resolveResidentId,
} from '../../../utils/chatIdentity'

const NAME_KEYS = ['nome', 'name', 'displayName', 'fullName', 'apelido', 'firstName']
const AVATAR_KEYS = ['fotoUrl', 'photoUrl', 'avatarUrl', 'avatar', 'imageUrl', 'picture', 'foto']

const pickFirst = (source, keys) => {
  if (!source || typeof source !== 'object') return null
  for (const key of keys) {
    const value = source[key]
    if (value && typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return null
}

const buildInitials = (name) => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const useResidentIdentity = ({ currentUser, fallbackProfile } = {}) => {
  const identitySources = useMemo(() => {
    const baseSources = [
      fallbackProfile,
      currentUser?.assistedPerson,
      currentUser?.elderlyProfile,
      currentUser?.role === 'elderly' ? currentUser.profile : null,
      currentUser?.role === 'elderly' ? currentUser : null,
    ]
    return collectIdentitySources(baseSources)
  }, [fallbackProfile, currentUser])

  const resolvedCpf = useMemo(() => resolveResidentCpf(identitySources), [identitySources])
  const resolvedId = useMemo(() => resolveResidentId(identitySources), [identitySources])

  const candidateProfiles = useMemo(() => {
    return [
      ...(identitySources || []),
      fallbackProfile,
      currentUser?.assistedPerson,
      currentUser?.elderlyProfile,
      currentUser?.role === 'elderly' ? currentUser.profile : null,
      currentUser?.role === 'elderly' ? currentUser : null,
    ].filter(Boolean)
  }, [identitySources, fallbackProfile, currentUser])

  const preferredProfile = useMemo(() => {
    if (!candidateProfiles.length) return null
    const matchesResolvedIdentity = (candidate) => {
      if (!candidate) return false
      const sources = collectIdentitySources([candidate])
      const candidateCpf = resolveResidentCpf(sources)
      const candidateId = resolveResidentId(sources)
      if (resolvedCpf && candidateCpf && normalizeIdentifierDigits(candidateCpf) === resolvedCpf) {
        return true
      }
      if (resolvedId && candidateId && String(candidateId) === String(resolvedId)) {
        return true
      }
      return false
    }

    const matched = candidateProfiles.find(matchesResolvedIdentity)
    if (matched) return matched
    return candidateProfiles.find((candidate) => Boolean(pickFirst(candidate, NAME_KEYS))) || candidateProfiles[0] || null
  }, [candidateProfiles, resolvedCpf, resolvedId])

  const name = useMemo(() => {
    return (
      pickFirst(preferredProfile, NAME_KEYS) ||
      pickFirst(currentUser, NAME_KEYS) ||
      currentUser?.email ||
      'Olá!'
    )
  }, [preferredProfile, currentUser])

  const avatarUrl = useMemo(() => {
    return pickFirst(preferredProfile, AVATAR_KEYS) || pickFirst(currentUser, AVATAR_KEYS) || null
  }, [preferredProfile, currentUser])

  const initials = useMemo(() => buildInitials(name), [name])

  return {
    profile: preferredProfile,
    name,
    avatarUrl,
    initials,
    cpf: resolvedCpf || null,
    residentId: resolvedId || null,
  }
}

export default useResidentIdentity
