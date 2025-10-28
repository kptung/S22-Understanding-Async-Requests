// ^ User is supposed to be authed when trying to reach routes like GET /cart, GET /admin/add-product, POST /cart/delete/:productId etc...
// ! User is NOT supposed to be authed when trying to reach GET and POST /login, GET and POST /signup
export default function isAuthed(flag = { shouldBeAuthed: true }) {
  return (req, res, next) => {
    if (flag.shouldBeAuthed ? !req.session.loggedIn : req.session.loggedIn) {
      return res.redirect(flag.shouldBeAuthed ? "/login" : "/");
    }
    return next();
  };
}
