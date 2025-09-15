import Router from 'express'

const router = Router();

router.get('/sighnup', (req, res) => {
  res.send('sighnup endpoint!')
})
router.get('/login', (req, res) => {
    res.send('login endpoint!')
})
router.get('/logout', (req, res) => {
    res.send('logout endpoint!')
})

export default router;