const express = require( 'express' );
const app = express();
app.use( express.json() );

app.post( '/hook', ( req, res ) => {
    console.log( 'received webhook', req.body );
    res.sendStatus( 200 );
} );

app.listen( 80, () => console.log( 'Node.js server started on port 80.' ) );
