const databaseService = require('./services/databaseService');
const bcrypt = require('bcrypt');

async function checkAndResetPasswords() {
    try {
        console.log('🔍 Vérification des utilisateurs et mots de passe...\n');

        // 1. Vérifier samuskl@gmail.com
        console.log('1. Vérification de samuskl@gmail.com...');
        const samuskl = await databaseService.query(
            'SELECT id, email, password_hash FROM users WHERE email = ?',
            ['samuskl@gmail.com']
        );

        if (samuskl.length === 0) {
            console.log('❌ Utilisateur samuskl@gmail.com non trouvé');
        } else {
            console.log(`✅ Utilisateur trouvé (ID: ${samuskl[0].id})`);
            console.log(`   Mot de passe hashé: ${samuskl[0].password_hash ? 'Présent' : 'Absent'}`);
            
            // Réinitialiser le mot de passe à 'password123'
            const newPassword = 'password123';
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await databaseService.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [hashedPassword, 'samuskl@gmail.com']
            );
            console.log(`✅ Mot de passe réinitialisé à: ${newPassword}`);
        }

        // 2. Vérifier admin@fusepoint.com
        console.log('\n2. Vérification de admin@fusepoint.com...');
        const admin = await databaseService.query(
            'SELECT id, email, password_hash FROM users WHERE email = ?',
            ['admin@fusepoint.com']
        );

        if (admin.length === 0) {
            console.log('❌ Utilisateur admin@fusepoint.com non trouvé');
        } else {
            console.log(`✅ Utilisateur trouvé (ID: ${admin[0].id})`);
            console.log(`   Mot de passe hashé: ${admin[0].password_hash ? 'Présent' : 'Absent'}`);
            
            // Réinitialiser le mot de passe à 'admin123'
            const newPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await databaseService.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [hashedPassword, 'admin@fusepoint.com']
            );
            console.log(`✅ Mot de passe réinitialisé à: ${newPassword}`);
        }

        // 3. Vérifier les rôles et statuts
        console.log('\n3. Vérification des rôles...');
        const users = await databaseService.query(
            'SELECT id, email, role, is_active FROM users WHERE email IN (?, ?)',
            ['samuskl@gmail.com', 'admin@fusepoint.com']
        );

        users.forEach(user => {
            console.log(`   ${user.email}: Role=${user.role}, Active=${user.is_active ? 'Oui' : 'Non'}`);
        });

        console.log('\n✅ Vérification terminée. Les mots de passe ont été réinitialisés.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

checkAndResetPasswords();