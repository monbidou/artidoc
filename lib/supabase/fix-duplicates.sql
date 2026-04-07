-- ============================================
-- FIX: Nettoyage doublons pour monbidou33160@gmail.com
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- 1) Voir les entrées auth.users pour cet email
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
FROM auth.users
WHERE email = 'monbidou33160@gmail.com'
ORDER BY created_at;

-- 2) Voir les entreprises associées
SELECT e.id, e.user_id, e.nom, e.metier, e.created_at
FROM entreprises e
JOIN auth.users u ON u.id = e.user_id
WHERE u.email = 'monbidou33160@gmail.com'
ORDER BY e.created_at;

-- 3) Supprimer les entreprises en double (garde la plus récente)
-- ATTENTION : adapter les IDs après avoir vérifié les résultats ci-dessus
DELETE FROM entreprises
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'monbidou33160@gmail.com'
)
AND id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM entreprises
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'monbidou33160@gmail.com'
  )
  ORDER BY user_id, created_at DESC
);

-- 4) Supprimer les auth.users en double (garde le plus récent)
-- IMPORTANT : Supabase ne permet pas de DELETE directement sur auth.users via SQL.
-- Utilisez le dashboard Supabase > Authentication > Users pour supprimer
-- manuellement le compte en double (celui avec la date created_at la plus ancienne).
--
-- Alternative via l'API admin (depuis un script serveur) :
-- await supabase.auth.admin.deleteUser('UUID_DU_DOUBLON')
