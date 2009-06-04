/**
 * COS integration JavaScript-file.
 * 
 * <b>Depends on</b> jQuery core
 * 
 * @author Matti Nelimarkka, HIIT, matti.nelimarkka@hiit.fi
 */

cos = {

	COS_URL: '/cos/',
	
	authenticate: {
	
		app_name: 'essi',
		app_password: 'testi',
		cos_user_id: '',
		
		auth: function(){
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'session',
				type: 'post',
				data: {
					app_name: cos.authenticate.app_name,
					app_password: cos.authenticate.app_password
				},
			});
		},
		
		login: function(user, pass){
			// Dummy implementation, first kill exsisting sessions
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'session',
				type: 'delete',
			});			
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'session',
				type: 'post',
				data: {
					username: user,
					password: pass,
					app_name: cos.authenticate.app_name,
					app_password: cos.authenticate.app_password
				},
				dataType: 'json',
				success: function(data, textStatus){
					cos.authenticate.cos_user_id = data.user_id;
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					cos.authenticate.cos_user_id = 'Fail: ' + XMLHttpRequest.status;
				}
			});
		}
		
	},
	
	user: {
		
		user = null;
	
		
		get_user: function(id){
			user = { self : {} , groups : {} , friends : {} , location : {}};
			// user data
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'people/' + id + '/@self',
				type: 'get',
				dataType: 'json',
				success: function(data, textStatus){
					user.self = data;
					cos.user.user = data;
				}
			});
			// get groups
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'people/' + id + '/@groups',
				type: 'get',
				dataType: 'json',
				success: function(data, textStatus){
					// handle this
					user.groups = data;
				}
			});
			// get friends
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'people/' + id + '/@friends',
				type: 'get',
				dataType: 'json',
				success: function(data, textStatus){
					// handle this
					user.friends = data;
				}
			});
			// get location
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'people/' + id + '/@location',
				type: 'get',
				dataType: 'json',
				success: function(data, textStatus){
					// handle this
					user.location = data;
				}
			});
			return user;
		},
		
		post_user: function(id, data, user){
			jQuery.ajax({
				async: false,
				url: cos.COS_URL + 'people/' + id + '/@self',
				type: 'put',
				data : data,
				dataType: 'json',
				success: function(data, textStatus){
					user.data = data
				}
			});
			return user;
		}
		
		
	}
}
