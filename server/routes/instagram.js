const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

/**
 * Routes pour l'API Instagram
 * Gère l'authentification OAuth et la récupération des données Instagram
 */

/**
 * @route POST /api/instagram/oauth/exchange
 * @desc Échange le code d'autorisation contre un access token
 * @access Private
 */
router.post('/oauth/exchange', authMiddleware, async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code d\'autorisation requis'
      });
    }

    // Configuration Instagram (utilise les mêmes credentials que Facebook)
    const appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.FRONTEND_URL}/oauth/instagram/callback`;

    if (!appId || !appSecret) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Instagram manquante'
      });
    }

    // Échanger le code contre un access token
    const formData = new URLSearchParams();
    formData.append('client_id', appId);
    formData.append('client_secret', appSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirectUri);
    formData.append('code', code);

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Erreur lors de l\'échange du code');
    }

    const tokenData = await tokenResponse.json();

    // Obtenir un token longue durée (60 jours)
    const longLivedParams = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: appSecret,
      access_token: tokenData.access_token
    });

    const longLivedResponse = await fetch(`https://graph.instagram.com/access_token?${longLivedParams.toString()}`);
    
    if (!longLivedResponse.ok) {
      throw new Error('Erreur lors de l\'obtention du token longue durée');
    }

    const longLivedData = await longLivedResponse.json();

    // Récupérer les informations utilisateur
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${longLivedData.access_token}`);
    const userData = await userResponse.json();

    res.json({
      success: true,
      data: {
        accessToken: longLivedData.access_token,
        expiresIn: longLivedData.expires_in,
        user: {
          id: userData.id,
          username: userData.username,
          accountType: userData.account_type,
          mediaCount: userData.media_count
        }
      }
    });

  } catch (error) {
    console.error('Erreur OAuth Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification Instagram',
      error: error.message
    });
  }
});

/**
 * @route POST /api/instagram/oauth/refresh
 * @desc Rafraîchit le token longue durée
 * @access Private
 */
router.post('/oauth/refresh', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken
    });

    const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        accessToken: data.access_token,
        expiresIn: data.expires_in
      }
    });

  } catch (error) {
    console.error('Erreur rafraîchissement token Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement du token',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/media
 * @desc Récupère les médias de l'utilisateur
 * @access Private
 */
router.get('/media', authMiddleware, async (req, res) => {
  try {
    const { accessToken, limit = 25, fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp' } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data || [],
      paging: data.paging
    });

  } catch (error) {
    console.error('Erreur médias Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des médias',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/media/:mediaId
 * @desc Récupère les détails d'un média spécifique
 * @access Private
 */
router.get('/media/:mediaId', authMiddleware, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    
    const response = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=${fields}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Erreur détails média Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails du média',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/media/:mediaId/insights
 * @desc Récupère les insights d'un média (compte business uniquement)
 * @access Private
 */
router.get('/media/:mediaId/insights', authMiddleware, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { accessToken, metrics = 'impressions,reach,engagement,saves,profile_visits,website_clicks' } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const response = await fetch(
      `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      
      // Si l'erreur indique que les insights ne sont pas disponibles
      if (error.error?.code === 100 || error.error?.message?.includes('Insights')) {
        return res.json({
          success: false,
          message: 'Les insights ne sont disponibles que pour les comptes business',
          error: 'INSIGHTS_NOT_AVAILABLE'
        });
      }
      
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data || [],
      mediaId: mediaId
    });

  } catch (error) {
    console.error('Erreur insights média Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des insights du média',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/insights
 * @desc Récupère les insights du compte (compte business uniquement)
 * @access Private
 */
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const { accessToken, metrics = 'impressions,reach,profile_views,website_clicks', period = 'day', since, until } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Construire l'URL des insights
    const params = new URLSearchParams({
      metric: metrics,
      period: period,
      access_token: accessToken
    });

    if (since) params.append('since', since);
    if (until) params.append('until', until);

    const response = await fetch(`https://graph.instagram.com/me/insights?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      
      // Si l'erreur indique que les insights ne sont pas disponibles
      if (error.error?.code === 100 || error.error?.message?.includes('Insights')) {
        return res.json({
          success: false,
          message: 'Les insights ne sont disponibles que pour les comptes business',
          error: 'INSIGHTS_NOT_AVAILABLE'
        });
      }
      
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data || [],
      period: { since, until },
      metrics: metrics.split(',')
    });

  } catch (error) {
    console.error('Erreur insights compte Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des insights du compte',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/user/profile
 * @desc Récupère le profil de l'utilisateur connecté
 * @access Private
 */
router.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Instagram');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Erreur profil Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/hashtags/popular
 * @desc Récupère les hashtags populaires (données simulées)
 * @access Private
 */
router.get('/hashtags/popular', authMiddleware, async (req, res) => {
  try {
    // Instagram ne fournit pas d'API publique pour les hashtags populaires
    // Retourner des données simulées basées sur les tendances marketing
    const popularHashtags = [
      { tag: 'marketing', count: 1000000, category: 'business' },
      { tag: 'digitalmarketing', count: 800000, category: 'business' },
      { tag: 'socialmedia', count: 750000, category: 'business' },
      { tag: 'entrepreneur', count: 600000, category: 'business' },
      { tag: 'business', count: 550000, category: 'business' },
      { tag: 'branding', count: 400000, category: 'business' },
      { tag: 'contentmarketing', count: 350000, category: 'business' },
      { tag: 'startup', count: 300000, category: 'business' },
      { tag: 'innovation', count: 250000, category: 'business' },
      { tag: 'leadership', count: 200000, category: 'business' }
    ];

    res.json({
      success: true,
      data: popularHashtags,
      note: 'Données simulées - API hashtags non disponible publiquement',
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur hashtags Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des hashtags',
      error: error.message
    });
  }
});

/**
 * @route GET /api/instagram/stats/summary
 * @desc Récupère un résumé des statistiques du compte
 * @access Private
 */
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Récupérer le profil utilisateur
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );
    
    if (!profileResponse.ok) {
      throw new Error('Erreur lors de la récupération du profil');
    }

    const profileData = await profileResponse.json();

    const summary = {
      user: profileData,
      mediaCount: profileData.media_count || 0,
      accountType: profileData.account_type,
      hasInsights: profileData.account_type === 'BUSINESS'
    };

    // Ajouter les insights si compte business
    if (profileData.account_type === 'BUSINESS') {
      try {
        const insightsResponse = await fetch(
          `https://graph.instagram.com/me/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
        );
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          summary.insights = insightsData.data;
        }
      } catch (error) {
        console.warn('Impossible de récupérer les insights:', error);
      }
    }

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Erreur résumé Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du résumé',
      error: error.message
    });
  }
});

module.exports = router;