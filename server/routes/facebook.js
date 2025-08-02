const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

/**
 * Routes pour l'API Facebook Marketing
 * Gère l'authentification OAuth et la récupération des données Facebook
 */

/**
 * @route POST /api/facebook/oauth/exchange
 * @desc Échange le code d'autorisation contre un access token
 * @access Private
 */
router.post('/oauth/exchange', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code d\'autorisation requis'
      });
    }

    // Configuration Facebook
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.FRONTEND_URL}/oauth/facebook/callback`;

    if (!appId || !appSecret) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Facebook manquante'
      });
    }

    // Échanger le code contre un access token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code
    });

    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`);
    
    if (!tokenResponse.ok) {
      throw new Error('Erreur lors de l\'échange du code');
    }

    const tokenData = await tokenResponse.json();

    // Obtenir un token longue durée
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: tokenData.access_token
    });

    const longLivedResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${longLivedParams.toString()}`);
    
    if (!longLivedResponse.ok) {
      throw new Error('Erreur lors de l\'obtention du token longue durée');
    }

    const longLivedData = await longLivedResponse.json();

    // Récupérer les informations utilisateur
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${longLivedData.access_token}`);
    const userData = await userResponse.json();

    // Récupérer les pages gérées
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category&access_token=${longLivedData.access_token}`);
    const pagesData = await pagesResponse.json();

    res.json({
      success: true,
      data: {
        accessToken: longLivedData.access_token,
        expiresIn: longLivedData.expires_in,
        user: userData,
        pages: pagesData.data || []
      }
    });

  } catch (error) {
    console.error('Erreur OAuth Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification Facebook',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facebook/pages/:pageId/insights
 * @desc Récupère les insights d'une page Facebook
 * @access Private
 */
router.get('/pages/:pageId/insights', authMiddleware, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { accessToken, metrics = 'page_impressions,page_reach,page_engaged_users', period = 'day', since, until } = req.query;

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

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/insights?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data,
      pageId: pageId,
      period: { since, until },
      metrics: metrics.split(',')
    });

  } catch (error) {
    console.error('Erreur insights Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des insights',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facebook/pages/:pageId/posts
 * @desc Récupère les posts d'une page Facebook avec leurs statistiques
 * @access Private
 */
router.get('/pages/:pageId/posts', authMiddleware, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { accessToken, limit = 25 } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Récupérer les posts
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,type,permalink_url&limit=${limit}&access_token=${accessToken}`
    );
    
    if (!postsResponse.ok) {
      const error = await postsResponse.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    const postsData = await postsResponse.json();

    // Récupérer les insights pour chaque post
    const postsWithInsights = await Promise.all(
      postsData.data.map(async (post) => {
        try {
          const insightsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${post.id}/insights?metric=post_impressions,post_reach,post_engaged_users,post_clicks,post_reactions_by_type_total&access_token=${accessToken}`
          );
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            return { ...post, insights: insightsData.data };
          }
          
          return { ...post, insights: null };
        } catch (error) {
          console.warn(`Impossible de récupérer les insights pour le post ${post.id}:`, error);
          return { ...post, insights: null };
        }
      })
    );

    res.json({
      success: true,
      data: postsWithInsights,
      pageId: pageId,
      paging: postsData.paging
    });

  } catch (error) {
    console.error('Erreur posts Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des posts',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facebook/pages/:pageId/posts/:postId/insights
 * @desc Récupère les insights détaillés d'un post spécifique
 * @access Private
 */
router.get('/pages/:pageId/posts/:postId/insights', authMiddleware, async (req, res) => {
  try {
    const { pageId, postId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const metrics = 'post_impressions,post_reach,post_engaged_users,post_clicks,post_reactions_by_type_total,post_video_views';
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=${metrics}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data,
      postId: postId,
      pageId: pageId
    });

  } catch (error) {
    console.error('Erreur insights post Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des insights du post',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facebook/pages
 * @desc Récupère la liste des pages gérées par l'utilisateur
 * @access Private
 */
router.get('/pages', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,fan_count,followers_count&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data || [],
      paging: data.paging
    });

  } catch (error) {
    console.error('Erreur pages Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pages',
      error: error.message
    });
  }
});

/**
 * @route GET /api/facebook/user/profile
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
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Facebook');
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Erreur profil Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
});

module.exports = router;