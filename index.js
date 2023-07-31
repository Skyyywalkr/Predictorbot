const express = require( 'express' );
const app = express();
app.use( express.json() );

app.post( '/hook', ( req, res ) => {
    console.log( 'received webhook', req.body );
    res.sendStatus( 200 );
} );

app.listen( 9000, () => console.log( 'Node.js server started on port 9000.' ) );
