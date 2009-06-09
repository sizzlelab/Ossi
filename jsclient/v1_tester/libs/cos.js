/**
 * COS integration JavaScript-file.
 * 
 * Should worl on mobile devices...
 *
 * @author Matti Nelimarkka, HIIT, matti.nelimarkka@hiit.fi
 */
cos = {

	COS_URL: '/cos/',
	
	authenticate: {
	
		app_name: 'essi',
		app_password: 'testi',
		cos_user_id: '',

		/* FIXME */		
		login: function(user, pass){
			// Dummy implementation, first kill exsisting sessions
			http_request( 'delete' , cos.COS_URL + 'session' , null );		
			data = http_request( 'post' , cos.COS_URL + 'session' ,  { username: user, password: pass,
					app_name: cos.authenticate.app_name, app_password: cos.authenticate.app_password } );
			cos.authenticate.cos_user_id = data.user_id;
		}
		
	},
	
	user: {
		
		get_user: function(id){
			var user = { id : id , self : {} , groups : {} , friends : {} , location : {}};
			// user data
			user.self = http_request( 'GET' , cos.COS_URL + 'people/' + id + '/@self' , null );
			// get groups
			user.groups = http_request( 'GET' , cos.COS_URL + 'people/' + id + '/@groups', null);
			// get friends
			user.friends = http_request( 'GET' , cos.COS_URL + 'people/' + id + '/@friends', null);
			// get location
			user.location = http_request( 'GET' , cos.COS_URL + 'people/' + id + '/@location', null);
			return user;
		},
		
		post_user: function(user, data){
			user.self = http_request( 'PUT' , cos.COS_URL + 'people/' + user.id + '/@self', data );
			return user;
		}
		
		
	}
}
