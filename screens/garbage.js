//check if the user has logged in

//   auth().onAuthStateChanged(user => {
//     if (user) {
//       console.log('user verified ');
//       phoneNumber = auth().currentUser.phoneNumber;
//       const firestore = firebase.firestore();
//       const userCollection = firestore.collection('users');
//       userCollection
//         .where('phoneNumber', '==', phoneNumber)
//         .get()
//         .then(querySnapshot => {
//           console.log(querySnapshot.size);
//           //  console.log();
//           if (querySnapshot.size === 1) {
//             console.log(' user profile exists');
//             setCurrentUser(querySnapshot[0].documentSnapshot.data());
//             console.log('current user is' + currentUser);
//           }
//           // querySnapshot.forEach(documentSnapshot => {
//           //   console.log(
//           //     'User ID: ',
//           //     documentSnapshot.id,
//           //     documentSnapshot.data(),
//           //   );
//         });
//     } else {
//       console.log('no user verified');
//       setCurrentUser(null);
//     }
//   });
// }, []);
